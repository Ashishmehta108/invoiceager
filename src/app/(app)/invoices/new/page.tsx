"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const schema = z.object({
  clientId: z.string().min(1, "Client is required"),
  services: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  taxPercent: z.coerce.number().min(0).max(100).default(0),
  dueDate: z.string().optional(),
  paymentDetails: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.coerce.number().positive(),
      unitPrice: z.coerce.number().nonnegative(),
    })
  ).optional().default([]),
});

export default function NewInvoicePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [formData, setFormData] = useState({
    clientId: "",
    services: "",
    amount: "",
    taxPercent: "0",
    dueDate: "",
    paymentDetails: "",
  });

  const { data: clients } = api.clients.list.useQuery({ limit: 100 });
  const createInvoiceMutation = api.invoices.create.useMutation();

  const calculateTotal = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = (subtotal * Number(formData.taxPercent)) / 100;
    return { subtotal, tax, total: subtotal + tax };
  };

  const { subtotal, tax, total } = calculateTotal();

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Math.random().toString(),
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const parsed = schema.safeParse({
        ...formData,
        amount: total,
        items: lineItems.map(({ id, ...item }) => item),
      });

      if (!parsed.success) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      await createInvoiceMutation.mutateAsync(parsed.data);
      toast.success("Invoice created successfully!");
      router.push("/invoices");
    } catch (error) {
      toast.error("Failed to create invoice");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create Invoice</h1>
          <p className="mt-1 text-slate-600">Add invoice details and line items</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <Card className="border-0 shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Invoice Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="clientId" className="text-sm font-medium text-slate-700">
                  Client <span className="text-red-500">*</span>
                </Label>
                <select
                  id="clientId"
                  required
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  <option value="">Select a client...</option>
                  {clients?.items.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="services" className="text-sm font-medium text-slate-700">
                  Services Description
                </Label>
                <Input
                  id="services"
                  placeholder="e.g., Web Development Services"
                  value={formData.services}
                  onChange={(e) =>
                    setFormData({ ...formData, services: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="dueDate" className="text-sm font-medium text-slate-700">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="taxPercent" className="text-sm font-medium text-slate-700">
                  Tax Percentage (%)
                </Label>
                <Input
                  id="taxPercent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taxPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, taxPercent: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="paymentDetails" className="text-sm font-medium text-slate-700">
                  Payment Details
                </Label>
                <Input
                  id="paymentDetails"
                  placeholder="UPI ID / Bank Account / Payment Terms"
                  value={formData.paymentDetails}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentDetails: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Line Items */}
        <Card className="border-0 shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Line Items</h2>
            <Button
              type="button"
              onClick={addLineItem}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
          <div className="p-6">
            {lineItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">No line items added yet</p>
                <Button
                  type="button"
                  onClick={addLineItem}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid gap-4 md:grid-cols-12 items-end p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="md:col-span-5">
                      <Label className="text-xs font-medium text-slate-700">Description</Label>
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(item.id, "description", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs font-medium text-slate-700">Quantity</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(item.id, "quantity", Number(e.target.value))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs font-medium text-slate-700">Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(item.id, "unitPrice", Number(e.target.value))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-sm">
                        <p className="text-xs text-slate-600 mb-1">Total</p>
                        <p className="font-semibold text-slate-900">
                          ₹{(item.quantity * item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      <Button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Summary */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Subtotal:</span>
              <span className="font-semibold text-slate-900">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700">
                Tax ({formData.taxPercent}%):
              </span>
              <span className="font-semibold text-slate-900">
                ₹{tax.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-slate-300 pt-3 flex justify-between items-center">
              <span className="text-lg font-bold text-slate-900">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/invoices" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
