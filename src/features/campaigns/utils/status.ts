import { CampaignStatus } from "@/features/campaigns/types";

export type CampaignStatusConfig = {
  label: string;
  bg: string;
  dot: string;
  accent: string;
};

export const CAMPAIGN_STATUS_CONFIG: Record<CampaignStatus, CampaignStatusConfig> = {
  active: {
    label: "Active",
    bg: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
    accent: "bg-green-500",
  },
  at_risk: {
    label: "At Risk",
    bg: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    accent: "bg-orange-500",
  },
  planned: {
    label: "Planned",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-400",
    accent: "bg-blue-400",
  },
  completed: {
    label: "Completed",
    bg: "bg-zinc-100 text-zinc-500 border-zinc-200",
    dot: "bg-zinc-400",
    accent: "bg-transparent",
  },
  archived: {
    label: "Archived",
    bg: "bg-zinc-100 text-zinc-400 border-zinc-200",
    dot: "bg-zinc-400",
    accent: "bg-transparent",
  },
};
