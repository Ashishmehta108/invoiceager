import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { invoices } from "@/server/db/schema";

export const reportsRouter = createTRPCRouter({
  /**
   * Get comprehensive analytics for a given month/year
   */
  analytics: protectedProcedure
    .input(
      z
        .object({
          month: z.number().min(1).max(12).optional(),
          year: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const month = input?.month ?? now.getMonth() + 1;
      const year = input?.year ?? now.getFullYear();
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);

      const monthInvoices = await ctx.db.query.invoices.findMany({
        where: (t, { and, eq, gte, lte }) =>
          and(
            eq(t.userId, ctx.session.user.id),
            gte(t.issuedAt, start),
            lte(t.issuedAt, end)
          ),
        with: { client: true },
      });

      const allTimeInvoices = await ctx.db.query.invoices.findMany({
        where: (t, { eq }) => eq(t.userId, ctx.session.user.id),
      });

      // Month calculations
      const monthTotalEarned = monthInvoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + Number(i.amount), 0);

      const monthTotalInvoiced = monthInvoices.reduce(
        (sum, i) => sum + Number(i.amount),
        0
      );

      const monthPaid = monthInvoices.filter(
        (i) => i.status === "paid"
      ).length;
      const monthPending = monthInvoices.filter(
        (i) => i.status === "sent"
      ).length;
      const monthOverdue = monthInvoices.filter(
        (i) => i.status === "overdue"
      ).length;

      // All-time calculations
      const allTimeTotalEarned = allTimeInvoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + Number(i.amount), 0);

      const allTimeTotalInvoiced = allTimeInvoices.reduce(
        (sum, i) => sum + Number(i.amount),
        0
      );

      const allTimePaid = allTimeInvoices.filter(
        (i) => i.status === "paid"
      ).length;
      const allTimePending = allTimeInvoices.filter(
        (i) => i.status === "sent"
      ).length;
      const allTimeOverdue = allTimeInvoices.filter(
        (i) => i.status === "overdue"
      ).length;

      // Top clients by revenue
      const clientRevenue: Record<string, { name: string; amount: number }> =
        {};
      monthInvoices
        .filter((i) => i.status === "paid")
        .forEach((i) => {
          if (!clientRevenue[i.clientId]) {
            clientRevenue[i.clientId] = {
              name: i.client.name,
              amount: 0,
            };
          }
          clientRevenue[i.clientId].amount += Number(i.amount);
        });

      const topClients = Object.values(clientRevenue)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Average invoice value
      const avgInvoiceValue =
        monthInvoices.length > 0
          ? monthTotalInvoiced / monthInvoices.length
          : 0;

      // Collection rate
      const collectionRate =
        monthTotalInvoiced > 0
          ? (monthTotalEarned / monthTotalInvoiced) * 100
          : 0;

      return {
        month,
        year,
        monthMetrics: {
          totalEarned: monthTotalEarned,
          totalInvoiced: monthTotalInvoiced,
          invoiceCount: monthInvoices.length,
          paidCount: monthPaid,
          pendingCount: monthPending,
          overdueCount: monthOverdue,
          avgInvoiceValue,
          collectionRate,
        },
        allTimeMetrics: {
          totalEarned: allTimeTotalEarned,
          totalInvoiced: allTimeTotalInvoiced,
          invoiceCount: allTimeInvoices.length,
          paidCount: allTimePaid,
          pendingCount: allTimePending,
          overdueCount: allTimeOverdue,
        },
        topClients,
      };
    }),

  /**
   * Get monthly revenue trend for the last 12 months
   */
  monthlyTrend: protectedProcedure
    .input(z.object({ months: z.number().min(1).max(24).default(12) }).optional())
    .query(async ({ ctx, input }) => {
      const months = input?.months ?? 12;
      const now = new Date();
      const trend = [];

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59, 999);

        const monthInvoices = await ctx.db.query.invoices.findMany({
          where: (t, { and, eq, gte, lte }) =>
            and(
              eq(t.userId, ctx.session.user.id),
              gte(t.issuedAt, start),
              lte(t.issuedAt, end)
            ),
        });

        const earned = monthInvoices
          .filter((i) => i.status === "paid")
          .reduce((sum, i) => sum + Number(i.amount), 0);

        const invoiced = monthInvoices.reduce(
          (sum, i) => sum + Number(i.amount),
          0
        );

        trend.push({
          month: date.toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
          }),
          earned,
          invoiced,
          invoiceCount: monthInvoices.length,
        });
      }

      return trend;
    }),

  /**
   * Get invoice status distribution
   */
  statusDistribution: protectedProcedure
    .input(
      z
        .object({
          month: z.number().min(1).max(12).optional(),
          year: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const month = input?.month ?? now.getMonth() + 1;
      const year = input?.year ?? now.getFullYear();
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);

      const monthInvoices = await ctx.db.query.invoices.findMany({
        where: (t, { and, eq, gte, lte }) =>
          and(
            eq(t.userId, ctx.session.user.id),
            gte(t.issuedAt, start),
            lte(t.issuedAt, end)
          ),
      });

      const distribution = {
        paid: monthInvoices.filter((i) => i.status === "paid").length,
        sent: monthInvoices.filter((i) => i.status === "sent").length,
        draft: monthInvoices.filter((i) => i.status === "draft").length,
        overdue: monthInvoices.filter((i) => i.status === "overdue").length,
      };

      return distribution;
    }),

  /**
   * Export invoices as CSV for a given period
   */
  exportCSV: protectedProcedure
    .input(
      z
        .object({
          month: z.number().min(1).max(12).optional(),
          year: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const month = input?.month ?? now.getMonth() + 1;
      const year = input?.year ?? now.getFullYear();
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);

      const monthInvoices = await ctx.db.query.invoices.findMany({
        where: (t, { and, eq, gte, lte }) =>
          and(
            eq(t.userId, ctx.session.user.id),
            gte(t.issuedAt, start),
            lte(t.issuedAt, end)
          ),
        with: { client: true },
      });

      // Generate CSV
      const headers = [
        "Invoice ID",
        "Client",
        "Amount",
        "Tax",
        "Total",
        "Status",
        "Issued Date",
        "Due Date",
        "Payment Details",
      ];

      const rows = monthInvoices.map((inv) => {
        const tax = (Number(inv.amount) * Number(inv.taxPercent)) / 100;
        const total = Number(inv.amount) + tax;
        return [
          inv.id,
          inv.client.name,
          Number(inv.amount).toFixed(2),
          tax.toFixed(2),
          total.toFixed(2),
          inv.status,
          new Date(inv.issuedAt).toLocaleDateString("en-IN"),
          inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "",
          inv.paymentDetails || "",
        ];
      });

      // Escape CSV values
      const escapeCsv = (value: string) => {
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      const csvContent = [
        headers.map(escapeCsv).join(","),
        ...rows.map((row) => row.map((cell) => escapeCsv(String(cell))).join(",")),
      ].join("\n");

      return {
        filename: `invoices-${year}-${String(month).padStart(2, "0")}.csv`,
        content: csvContent,
      };
    }),

  /**
   * Get detailed invoice list with filtering
   */
  invoiceList: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["draft", "sent", "paid", "overdue"]).optional(),
          month: z.number().min(1).max(12).optional(),
          year: z.number().optional(),
          limit: z.number().int().min(1).max(500).default(100),
          offset: z.number().int().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const month = input?.month ?? now.getMonth() + 1;
      const year = input?.year ?? now.getFullYear();
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      const status = input?.status;
      const limit = input?.limit ?? 100;
      const offset = input?.offset ?? 0;

      const invoiceList = await ctx.db.query.invoices.findMany({
        where: (t, { and, eq, gte, lte }) =>
          and(
            eq(t.userId, ctx.session.user.id),
            gte(t.issuedAt, start),
            lte(t.issuedAt, end),
            status ? eq(t.status, status) : undefined
          ),
        with: { client: true, items: true },
        limit,
        offset,
        orderBy: (t, { desc }) => [desc(t.issuedAt)],
      });

      const total = await ctx.db.query.invoices.findMany({
        where: (t, { and, eq, gte, lte }) =>
          and(
            eq(t.userId, ctx.session.user.id),
            gte(t.issuedAt, start),
            lte(t.issuedAt, end),
            status ? eq(t.status, status) : undefined
          ),
      });

      return {
        invoices: invoiceList,
        total: total.length,
        limit,
        offset,
      };
    }),
});
