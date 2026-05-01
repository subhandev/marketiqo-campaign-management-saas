"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignTable } from "@/features/campaigns/components/CampaignTable";
import {
  useCampaigns,
  useCampaignMutations,
} from "@/features/campaigns/hooks/useCampaigns";
import { CampaignStatus } from "@/features/campaigns/types";

type FilterType = "all" | CampaignStatus;

export default function CampaignsPage() {
  const router = useRouter();
  const { campaigns, loading, error, refresh } = useCampaigns();
  const { remove } = useCampaignMutations();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = campaigns
    .filter((c) => filter === "all" || c.status === filter)
    .filter((c) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.client?.name.toLowerCase().includes(q) ||
        c.platform.toLowerCase().includes(q)
      );
    });

  const count = (status: CampaignStatus) =>
    campaigns.filter((c) => c.status === status).length;

  const handleDelete = async (id: string) => {
    await remove(id);
    refresh();
  };

  if (!loading && campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Megaphone className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">No campaigns yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Create your first campaign to start tracking performance and
            generating AI insights.
          </p>
        </div>
        <Button onClick={() => router.push("/campaigns/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all your marketing campaigns
          </p>
        </div>
        <Button onClick={() => router.push("/campaigns/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center justify-between gap-4">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterType)}
        >
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">
              All
              <span className="ml-1.5 text-xs bg-background px-1.5 py-0.5 rounded-full">
                {campaigns.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="active">
              Active
              <span className="ml-1.5 text-xs bg-background px-1.5 py-0.5 rounded-full">
                {count("active")}
              </span>
            </TabsTrigger>
            <TabsTrigger value="at_risk">
              At Risk
              <span className="ml-1.5 text-xs bg-background px-1.5 py-0.5 rounded-full">
                {count("at_risk")}
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              <span className="ml-1.5 text-xs bg-background px-1.5 py-0.5 rounded-full">
                {count("completed")}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Input
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">Loading campaigns...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">
            No campaigns match your search.
          </p>
        </div>
      ) : (
        <CampaignTable campaigns={filtered} onDelete={handleDelete} />
      )}
    </div>
  );
}
