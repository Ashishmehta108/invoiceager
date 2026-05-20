"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, Mail, FileText } from "lucide-react";
import { toast } from "sonner";

interface EditingClient {
  id: string;
  name: string;
  email: string;
  gstin: string;
  notes: string;
}

export default function ClientsPage() {
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<EditingClient | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gstin: "",
    notes: "",
  });

  const { data: clientsData, refetch } = api.clients.list.useQuery({ limit: 100 });
  const createClientMutation = api.clients.create.useMutation();
  const updateClientMutation = api.clients.update.useMutation();
  const deleteClientMutation = api.clients.delete.useMutation();

  const clients = clientsData?.items ?? [];

  const resetForm = () => {
    setFormData({ name: "", email: "", gstin: "", notes: "" });
    setIsAddingClient(false);
    setEditingClient(null);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Client name is required");
      return;
    }

    try {
      await createClientMutation.mutateAsync({
        name: formData.name,
        email: formData.email || "",
        gstin: formData.gstin || "",
        notes: formData.notes || "",
      });
      toast.success("Client added successfully!");
      resetForm();
      refetch();
    } catch (error) {
      toast.error("Failed to add client");
    }
  };

  const handleEditClient = (client: typeof clients[0]) => {
    setEditingClient({
      id: client.id,
      name: client.name,
      email: client.email || "",
      gstin: client.gstin || "",
      notes: client.notes || "",
    });
    setFormData({
      name: client.name,
      email: client.email || "",
      gstin: client.gstin || "",
      notes: client.notes || "",
    });
    setIsAddingClient(false);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !formData.name.trim()) {
      toast.error("Client name is required");
      return;
    }

    try {
      await updateClientMutation.mutateAsync({
        id: editingClient.id,
        name: formData.name,
        email: formData.email || "",
        gstin: formData.gstin || "",
        notes: formData.notes || "",
      });
      toast.success("Client updated successfully!");
      resetForm();
      refetch();
    } catch (error) {
      toast.error("Failed to update client");
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      await deleteClientMutation.mutateAsync({ id: clientId });
      toast.success("Client deleted successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to delete client");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="mt-2 text-slate-600">Manage your client information</p>
        </div>
        {!isAddingClient && !editingClient && (
          <Button
            onClick={() => setIsAddingClient(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAddingClient || editingClient) && (
        <Card className="border-0 shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              {editingClient ? "Edit Client" : "Add New Client"}
            </h2>
          </div>
          <form
            onSubmit={editingClient ? handleUpdateClient : handleAddClient}
            className="p-6 space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                  Client Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter client name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="gstin" className="text-sm font-medium text-slate-700">
                  GSTIN
                </Label>
                <Input
                  id="gstin"
                  placeholder="GSTIN"
                  value={formData.gstin}
                  onChange={(e) =>
                    setFormData({ ...formData, gstin: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
                  Notes
                </Label>
                <Input
                  id="notes"
                  placeholder="Additional notes about the client"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editingClient ? "Update Client" : "Add Client"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Clients List */}
      {clients.length === 0 ? (
        <Card className="border-0 bg-slate-50 shadow-sm">
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="rounded-full bg-slate-200 p-3 mb-4">
              <FileText className="h-6 w-6 text-slate-600" />
            </div>
            <p className="text-center text-slate-600 mb-4">
              No clients yet. Add your first client to get started.
            </p>
            <Button
              onClick={() => setIsAddingClient(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Add First Client
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card
              key={client.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6 space-y-4">
                {/* Client Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {client.name}
                    </h3>
                    {client.gstin && (
                      <p className="text-xs text-slate-600 mt-1">
                        GSTIN: {client.gstin}
                      </p>
                    )}
                  </div>
                </div>

                {/* Client Details */}
                <div className="space-y-2">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <a
                        href={`mailto:${client.email}`}
                        className="hover:text-blue-600 truncate"
                      >
                        {client.email}
                      </a>
                    </div>
                  )}
                  {client.notes && (
                    <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                      {client.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  <Button
                    onClick={() => handleEditClient(client)}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteClient(client.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
