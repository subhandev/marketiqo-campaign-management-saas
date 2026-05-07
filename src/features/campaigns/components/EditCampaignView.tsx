"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CampaignDetailSkeleton } from "@/features/campaigns/components/CampaignDetailSkeleton";
import { CreateCampaignForm } from "@/features/campaigns/components/CreateCampaignForm";
import { useCampaign } from "@/features/campaigns/hooks/useCampaigns";

type EditCampaignViewProps = {
  id: string;
};

export function EditCampaignView({ id }: EditCampaignViewProps) {
  const { campaign, loading, error } = useCampaign(id);

  if (loading) return <CampaignDetailSkeleton />;

  if (error || !campaign) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-sm text-destructive">
          {error ?? "Campaign not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <Link
        href={`/campaigns/${campaign.id}`}
        className="group inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card transition-colors group-hover:bg-muted">
          <ArrowLeft className="h-3.5 w-3.5" />
        </span>
        Back to Campaign
      </Link>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Campaign</h1>
        <p className="text-sm text-muted-foreground">
          Update campaign details, ownership, status, and timeline.
        </p>
      </div>

      <CreateCampaignForm campaign={campaign} mode="edit" />
    </div>
  );
}
