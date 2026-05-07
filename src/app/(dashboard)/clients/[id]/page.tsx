"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { ClientDetail } from "@/features/clients/components/ClientDetail";
import { ClientDetailSkeleton } from "@/features/clients/components/ClientDetailSkeleton";
import { useClient } from "@/features/clients/hooks/useClients";

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const initialEdit = searchParams.get("edit") === "true";
  const { client, insights, loading, error, refresh } = useClient(id);

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
      initialEdit={initialEdit}
      onEditSuccess={refresh}
    />
  );
}
