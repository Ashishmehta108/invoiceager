import { redirect } from "next/navigation";
import { z } from "zod";
import { api } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  clientId: z.string().min(1),
  services: z.string().optional(),
  amount: z.coerce.number().positive(),
  taxPercent: z.coerce.number().min(0).max(100).default(0),
  dueDate: z.string().optional(),
  paymentDetails: z.string().optional(),
});

async function createInvoice(formData: FormData) {
  "use server";
  const parsed = schema.safeParse({
    clientId: formData.get("clientId"),
    services: formData.get("services") || "",
    amount: formData.get("amount"),
    taxPercent: formData.get("taxPercent") || 0,
    dueDate: formData.get("dueDate") || undefined,
    paymentDetails: formData.get("paymentDetails") || "",
  });
  if (!parsed.success) return;
  await api.invoices.create(parsed.data);
  redirect("/invoices");
}

export default async function NewInvoicePage() {
  const clients = (await api.clients.list({ limit: 100 })).items;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Invoice</h1>
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-600">
            Invoice details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createInvoice} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="clientId">Client</Label>
              <select
                id="clientId"
                name="clientId"
                required
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="services">Services</Label>
              <Input
                id="services"
                name="services"
                placeholder="Describe services"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxPercent">Tax %</Label>
              <Input
                id="taxPercent"
                name="taxPercent"
                type="number"
                step="0.01"
                defaultValue={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="paymentDetails">Payment Details</Label>
              <Input
                id="paymentDetails"
                name="paymentDetails"
                placeholder="UPI / Bank info"
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Create Invoice
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
