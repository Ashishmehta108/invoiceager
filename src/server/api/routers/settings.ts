import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";

export const settingsRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: (t, { eq }) => eq(t.id, ctx.session.user.id),
    });
    if (!user) return null;
    return {
      businessName: user.businessName ?? "",
      gstin: user.gstin ?? "",
      bankInfo: user.bankInfo ?? "",
    };
  }),
  updateProfile: protectedProcedure
    .input(z.object({ businessName: z.string().optional(), gstin: z.string().optional(), bankInfo: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.db
        .update(users)
        .set({
          businessName: input.businessName ?? null,
          gstin: input.gstin ?? null,
          bankInfo: input.bankInfo ?? null,
        })
        .where((t, { eq }) => eq(t.id, ctx.session.user.id))
        .returning();
      return res[0] ?? null;
    }),
});


