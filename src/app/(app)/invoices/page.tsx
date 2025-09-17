import Link from "next/link";
import { revalidatePath } from "next/cache";
import { api } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

async function markPaidAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await api.invoices.markPaid({ id });
  revalidatePath("/invoices");
}

export default async function InvoicesPage() {
  const data = await api.invoices.list({ limit: 20 });
  const items = data.items;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
          <Link href="/invoices/new">New Invoice</Link>
        </Button>
      </div>
      {items.length === 0 ? (
        <EmptyState title="No invoices" description="Create your first invoice to get started." />
      ) : (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-2 font-medium">Client</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Issued</th>
                <th className="px-4 py-2 font-medium">Due</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => (
                <tr key={inv.id} className="border-t border-zinc-200">
                  <td className="px-4 py-2">{inv.client?.name ?? "—"}</td>
                  <td className="px-4 py-2">₹{Number(inv.amount).toFixed(2)}</td>
                  <td className="px-4 py-2 capitalize">{inv.status}</td>
                  <td className="px-4 py-2">{inv.issuedAt?.toLocaleDateString?.() ?? "—"}</td>
                  <td className="px-4 py-2">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Link href={`/invoices/${inv.id}`} className="text-indigo-600 hover:underline">View</Link>
                      {inv.status !== "paid" && (
                        <form action={markPaidAction}>
                          <input type="hidden" name="id" value={inv.id} />
                          <Button size="sm" variant="outline" className="border-zinc-300">Mark Paid</Button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


