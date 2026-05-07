import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";
import { CreateCampaignForm } from "@/features/campaigns/components/CreateCampaignForm";

export default function NewCampaignPage() {
  return (
    <div className="w-full space-y-6">
      <Link
        href="/campaigns"
        className="group inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
        </span>
        Back to Campaigns
      </Link>

      <div className="rounded-2xl border border-border bg-card px-5 py-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Create Campaign
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up the campaign profile you&apos;ll use to track performance,
                metrics, and AI insights.
              </p>
            </div>
          </div>
          <span className="w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            New campaign
          </span>
        </div>
      </div>

      <CreateCampaignForm />
    </div>
  );
}