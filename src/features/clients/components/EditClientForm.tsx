"use client";

import { useClientMutations } from "@/features/clients/hooks/useClients";
import { ClientForm } from "@/features/clients/components/CreateClientForm";
import { CreateClientSchema } from "@/features/clients/schemas";
import { Client } from "@/features/clients/types";

interface EditClientFormProps {
  client: Client;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditClientForm({
  client,
  onSuccess,
  onCancel,
}: EditClientFormProps) {
  const { update, loading, error } = useClientMutations();

  const onSubmit = async (data: CreateClientSchema) => {
    await update(client.id, data);
    onSuccess();
  };

  return (
    <ClientForm
      defaultValues={{
        name: client.name,
        company: client.company ?? "",
        industry: client.industry ?? "",
        email: client.email ?? "",
        phone: client.phone ?? "",
        website: client.website ?? "",
        notes: client.notes ?? "",
      }}
      submitLabel="Save Changes"
      submittingLabel="Saving..."
      detailsTitle="Edit client details"
      detailsDescription="Update this client profile. Changes apply across related campaigns and reports."
      previewDescription="Preview how the updated client profile will appear in your workspace."
      onSubmit={onSubmit}
      onCancel={onCancel}
      error={error}
      loading={loading}
    />
  );
}
