import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { clients } from "@/server/db/schema";

export const clientInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  gstin: z.string().max(32).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const clientsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor ?? undefined;
      const search = input?.search?.trim();

      const rows = await ctx.db.query.clients.findMany({
        where: (tbl, { and, eq, ilike }) =>
          and(
            eq(tbl.userId, ctx.session.user.id),
            search ? ilike(tbl.name, `%${search}%`) : undefined,
          ),
        limit: limit + 1,
        orderBy: (tbl, { desc }) => [desc(tbl.createdAt)],
        ...(cursor ? { where: (tbl, { and, lt }) => and(lt(tbl.id, cursor)) } : {}),
      });

      let nextCursor: string | undefined = undefined;
      if (rows.length > limit) {
        const next = rows.pop();
        nextCursor = next?.id;
      }
      return { items: rows, nextCursor };
    }),

  create: protectedProcedure
    .input(clientInput)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .insert(clients)
        .values({
          userId: ctx.session.user.id,
          name: input.name,
          email: input.email || null,
          gstin: input.gstin || null,
          notes: input.notes || null,
        })
        .returning();
      return row;
    }),

  update: protectedProcedure
    .input(
      clientInput.extend({ id: z.string().min(1) })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const res = await ctx.db
        .update(clients)
        .set({
          name: data.name,
          email: data.email || null,
          gstin: data.gstin || null,
          notes: data.notes || null,
        })
        .where((tbl, { and, eq }) => and(eq(tbl.id, id), eq(tbl.userId, ctx.session.user.id)))
        .returning();
      return res[0] ?? null;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.db
        .delete(clients)
        .where((tbl, { and, eq }) => and(eq(tbl.id, input.id), eq(tbl.userId, ctx.session.user.id)))
        .returning();
      return res[0] ?? null;
    }),
});


