import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function InvoiceViewPage({ params }: { params: { id: string } }) {
  const invoice = await api.invoices.getById({ id: params.id });
  if (!invoice) return notFound();

  const taxAmount = (Number(invoice.amount) * Number(invoice.taxPercent ?? 0)) / 100;
  const total = Number(invoice.amount) + taxAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoice</h1>
        <Link
          href={`/api/invoices/${invoice.id}/pdf`}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Download PDF
        </Link>
      </div>
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-600">{invoice.client?.name ?? "Client"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-700">
          <p><span className="text-zinc-500">Status:</span> <span className="capitalize">{invoice.status}</span></p>
          <p><span className="text-zinc-500">Issued:</span> {invoice.issuedAt?.toLocaleDateString?.() ?? "—"}</p>
          <p><span className="text-zinc-500">Due:</span> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}</p>
          <p><span className="text-zinc-500">Amount:</span> ₹{Number(invoice.amount).toFixed(2)}</p>
          <p><span className="text-zinc-500">Tax %:</span> {Number(invoice.taxPercent ?? 0).toFixed(2)}%</p>
          <p><span className="text-zinc-500">Total:</span> ₹{total.toFixed(2)}</p>
          {invoice.services && (
            <p className="whitespace-pre-wrap"><span className="text-zinc-500">Services:</span> {invoice.services}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


