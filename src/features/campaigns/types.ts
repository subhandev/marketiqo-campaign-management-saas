export type CampaignStatus = "planned" | "active" | "at_risk" | "completed" | "archived";

export type Metric = {
  id: string;
  campaignId: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number | null;
  revenue: number | null;
  date: string;
};

export type Insight = {
  id: string;
  campaignId: string;
  type: string;
  content: string;
  score: number | null;
  createdAt: string;
};

export type Campaign = {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  platform: string;
  status: CampaignStatus;
  goal: string | null;
  startDate: string | null;
  endDate: string | null;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    industry: string | null;
  };
  metrics?: Metric[];
  insights?: Insight[];
};

export type CreateCampaignInput = {
  clientId: string;
  name: string;
  description?: string;
  platform: string;
  status?: CampaignStatus;
  goal?: string;
  startDate?: string;
  endDate?: string;
  deadline?: string;
};

export type UpdateCampaignInput = Partial<CreateCampaignInput>;

export type CampaignsResponse = {
  campaigns: Campaign[];
  total: number;
};

export type CampaignResponse = {
  campaign: Campaign;
};

export type CreateMetricInput = {
  date: string;
  impressions?: number;
  clicks?: number;
  spend?: number;
  conversions?: number;
  revenue?: number;
};