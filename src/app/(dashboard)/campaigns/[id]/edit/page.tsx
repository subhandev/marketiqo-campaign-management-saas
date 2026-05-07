"use client";

import { use } from "react";
import { EditCampaignView } from "@/features/campaigns/components/EditCampaignView";

export default function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EditCampaignView id={id} />;
}
