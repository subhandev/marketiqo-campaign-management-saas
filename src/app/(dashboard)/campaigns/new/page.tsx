import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateCampaignForm } from "@/features/campaigns/components/CreateCampaignForm";

export default function NewCampaignPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Back */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <span className="flex items-center justify-center h-7 w-7 rounded-md border border-border bg-card group-hover:bg-muted transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
        </span>
        Back to Campaigns
      </Link>

      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Campaign
        </h1>
        <p className="text-sm text-muted-foreground">
          Set up your campaign details to start tracking performance.
        </p>
      </div>

      {/* Form */}
      <CreateCampaignForm />
    </div>
  );
}