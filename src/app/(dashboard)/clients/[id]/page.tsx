// src/app/(dashboard)/clients/[id]/page.tsx

"use client";

import { use } from "react";
import { ClientDetail } from "@/features/clients/components/ClientDetail";
import { useClient } from "@/features/clients/hooks/useClients";

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { client, loading, error } = useClient(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-sm text-muted-foreground">Loading client...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-sm text-destructive">
          {error ?? "Client not found"}
        </p>
      </div>
    );
  }

  return <ClientDetail client={client} />;
}