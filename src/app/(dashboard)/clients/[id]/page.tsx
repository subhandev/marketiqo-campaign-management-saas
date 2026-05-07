"use client";

import { use } from "react";
import { ClientDetail } from "@/features/clients/components/ClientDetail";
import { ClientDetailSkeleton } from "@/features/clients/components/ClientDetailSkeleton";
import { useClient } from "@/features/clients/hooks/useClients";

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { client, insights, loading, error } = useClient(id);

  if (loading) return <ClientDetailSkeleton />;

  if (error || !client) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-sm text-destructive">{error ?? "Client not found"}</p>
      </div>
    );
  }

  return (
    <ClientDetail
      client={client}
      insights={insights}
    />
  );
}
