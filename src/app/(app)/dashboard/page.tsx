import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/server";

export default async function DashboardPage() {
  const summary = await api.dashboard.summary();
  const recent = await api.dashboard.recent({ limit: 5 });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-600">Total earned this month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">₹{summary.totalEarned.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-600">Pending invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{summary.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-600">Overdue invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{summary.overdue}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-600">Recent invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-zinc-600">No recent invoices</p>
          ) : (
            <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-600">
                  <tr>
                    <th className="px-4 py-2 font-medium">Client</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((inv) => (
                    <tr key={inv.id} className="border-t border-zinc-200">
                      <td className="px-4 py-2">{inv.client?.name ?? "—"}</td>
                      <td className="px-4 py-2">₹{Number(inv.amount).toFixed(2)}</td>
                      <td className="px-4 py-2 capitalize">{inv.status}</td>
                      <td className="px-4 py-2">{inv.issuedAt?.toLocaleDateString?.() ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


