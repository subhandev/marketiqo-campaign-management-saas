"use client";

import { use } from "react";
import { EditClientView } from "@/features/clients/components/EditClientView";

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <EditClientView clientId={id} />;
}
