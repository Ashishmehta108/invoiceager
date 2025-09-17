import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { invoices } from "@/server/db/schema";

export const dashboardRouter = createTRPCRouter({
  summary: protectedProcedure
    .input(
      z
        .object({
          month: z.number().min(1).max(12).optional(),
          year: z.number().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const month = input?.month ?? now.getMonth() + 1;
      const year = input?.year ?? now.getFullYear();
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);

      const all = await ctx.db.query.invoices.findMany({
        where: (t, { and, eq, gte, lte }) =>
          and(
            eq(t.userId, ctx.session.user.id),
            gte(t.issuedAt, start),
            lte(t.issuedAt, end),
          ),
      });

      const totalEarned = all
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + Number(i.amount), 0);
      const pending = all.filter((i) => i.status !== "paid").length;
      const overdue = all.filter((i) => i.status === "overdue").length;

      return { totalEarned, pending, overdue };
    }),

  recent: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(5) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 5;
      return ctx.db.query.invoices.findMany({
        where: (t, { eq }) => eq(t.userId, ctx.session.user.id),
        orderBy: (t, { desc }) => [desc(t.issuedAt)],
        limit,
        with: { client: true },
      });
    }),
});
