import { api } from "@/trpc/server";
import { Card } from "@/components/ui/card";
import { TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const summary = await api.dashboard.summary();
  const recent = await api.dashboard.recent({ limit: 8 });

  const totalPending = summary.pending;
  const totalOverdue = summary.overdue;
  const totalEarned = summary.totalEarned;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Welcome back! Here's your invoicing overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Earned */}
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-6">
            <div>
              <p className="text-sm font-medium text-emerald-600">Total Earned</p>
              <p className="mt-2 text-3xl font-bold text-emerald-900">
                ₹{totalEarned.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-200 p-3">
              <CheckCircle className="h-6 w-6 text-emerald-700" />
            </div>
          </div>
        </Card>

        {/* Pending Invoices */}
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-6">
            <div>
              <p className="text-sm font-medium text-blue-600">Pending</p>
              <p className="mt-2 text-3xl font-bold text-blue-900">
                {totalPending}
              </p>
              <p className="mt-1 text-xs text-blue-600">invoices awaiting payment</p>
            </div>
            <div className="rounded-lg bg-blue-200 p-3">
              <Clock className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </Card>

        {/* Overdue Invoices */}
        <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between p-6">
            <div>
              <p className="text-sm font-medium text-red-600">Overdue</p>
              <p className="mt-2 text-3xl font-bold text-red-900">
                {totalOverdue}
              </p>
              <p className="mt-1 text-xs text-red-600">requires immediate action</p>
            </div>
            <div className="rounded-lg bg-red-200 p-3">
              <AlertCircle className="h-6 w-6 text-red-700" />
            </div>
          </div>
        </Card>

        {/* Quick Action */}
        <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center p-6 h-full">
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              Create Invoice
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Invoices Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent Invoices</h2>
          <Link
            href="/invoices"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <Card className="border-0 bg-slate-50 shadow-sm">
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="rounded-full bg-slate-200 p-3 mb-4">
                <TrendingUp className="h-6 w-6 text-slate-600" />
              </div>
              <p className="text-center text-slate-600">
                No invoices yet. Start by creating your first invoice.
              </p>
              <Link
                href="/invoices/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Create Invoice
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Issued Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        {invoice.client.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        ₹{Number(invoice.amount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            invoice.status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : invoice.status === "overdue"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(invoice.issuedAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}


