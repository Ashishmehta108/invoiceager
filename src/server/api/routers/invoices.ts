import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { invoiceItems, invoices } from "@/server/db/schema";

const baseInvoiceInput = z.object({
  clientId: z.string().min(1),
  services: z.string().optional().or(z.literal("")),
  amount: z.coerce.number().nonnegative(),
  taxPercent: z.coerce.number().min(0).max(100).default(0),
  dueDate: z.coerce.date().optional(),
  paymentDetails: z.string().optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.coerce.number().positive().default(1),
        unitPrice: z.coerce.number().nonnegative(),
      })
    )
    .optional()
    .default([]),
});

export const invoicesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["paid", "unpaid", "overdue"]).optional(),
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor ?? undefined;
      const status = input?.status;

      const rows = await ctx.db.query.invoices.findMany({
        where: (tbl, { and, eq }) =>
          and(
            eq(tbl.userId, ctx.session.user.id),
            status ? eq(tbl.status, status) : undefined,
          ),
        limit: limit + 1,
        orderBy: (tbl, { desc }) => [desc(tbl.issuedAt)],
        ...(cursor ? { where: (tbl, { and, lt }) => and(lt(tbl.id, cursor)) } : {}),
        with: { client: true },
      });

      let nextCursor: string | undefined = undefined;
      if (rows.length > limit) {
        const next = rows.pop();
        nextCursor = next?.id;
      }
      return { items: rows, nextCursor };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.invoices.findFirst({
        where: (tbl, { and, eq }) => and(eq(tbl.id, input.id), eq(tbl.userId, ctx.session.user.id)),
        with: { items: true, client: true },
      });
      return row ?? null;
    }),

  create: protectedProcedure
    .input(baseInvoiceInput)
    .mutation(async ({ ctx, input }) => {
      const [inv] = await ctx.db
        .insert(invoices)
        .values({
          userId: ctx.session.user.id,
          clientId: input.clientId,
          services: input.services || null,
          amount: input.amount,
          taxPercent: input.taxPercent,
          dueDate: input.dueDate ?? null,
          paymentDetails: input.paymentDetails || null,
          status: "sent",
        })
        .returning();

      if (input.items && input.items.length > 0) {
        const values = input.items.map((it) => ({
          invoiceId: inv.id,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          lineTotal: Math.round((it.quantity * it.unitPrice) * 100) / 100,
        }));
        await ctx.db.insert(invoiceItems).values(values);
      }
      return inv;
    }),

  markPaid: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.db
        .update(invoices)
        .set({ status: "paid" })
        .where((tbl, { and, eq }) => and(eq(tbl.id, input.id), eq(tbl.userId, ctx.session.user.id)))
        .returning();
      return res[0] ?? null;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // cascade delete items first (if not using DB FK cascade)
      await ctx.db
        .delete(invoiceItems)
        .where((tbl, { eq }) => eq(tbl.invoiceId, input.id));
      const res = await ctx.db
        .delete(invoices)
        .where((tbl, { and, eq }) => and(eq(tbl.id, input.id), eq(tbl.userId, ctx.session.user.id)))
        .returning();
      return res[0] ?? null;
    }),
});


