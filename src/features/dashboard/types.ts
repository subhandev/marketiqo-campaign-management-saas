import type { CampaignStatus } from "@/features/campaigns/types";

export interface DashboardData {
  stats: {
    totalClients: number;
    activeCampaigns: number;
    atRiskCampaigns: number;
    completedCampaigns: number;
    totalSpend: number;
  };
  health: {
    active: number;
    at_risk: number;
    completed: number;
    planned: number;
    archived: number;
    total: number;
  };
  recentCampaigns: {
    id: string;
    name: string;
    platform: string;
    status: CampaignStatus;
    deadline: string | null;
    client: { id: string; name: string; industry: string | null } | null;
  }[];
  atRiskCampaignsList: {
    id: string;
    name: string;
    platform: string;
    deadline: string | null;
    client: { id: string; name: string; industry: string | null } | null;
  }[];
  recentClients: {
    id: string;
    name: string;
    industry: string | null;
    status: string;
    campaignCount: number;
  }[];
}

export type PortfolioAiCategory = "performance" | "risk" | "budget" | "next_action";
export type PortfolioAiSeverity = "positive" | "info" | "warning" | "critical";

export interface PortfolioAiInsight {
  category: PortfolioAiCategory;
  severity: PortfolioAiSeverity;
  headline: string;
  insight: string;
  recommendedAction: string;
  campaignId?: string;
  campaignName?: string;
}

export interface PortfolioAiBrief {
  briefTitle: string;
  summary: string;
  generatedAt: string;
  source: "ai" | "fallback";
  insights: PortfolioAiInsight[];
}
