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
  budget: number | null;
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

export type CampaignListItem = {
  id: string;
  name: string;
  platform: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  client: { id: string; name: string };
  latestMetric: {
    spend: number;
    budget: number;
    clicks: number;
    conversions: number;
    spendChange: number | null;
    clicksChange: number | null;
    conversionsChange: number | null;
    recordedAt: string;
  } | null;
  latestInsight: {
    id: string;
    content: string;
    createdAt: string;
  } | null;
  _count: { metrics: number };
};

export type CreateCampaignInput = {
  clientId: string;
  name: string;
  description?: string;
  platform: string;
  status?: CampaignStatus;
  goal?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  deadline?: string;
};

export type UpdateCampaignInput = Partial<CreateCampaignInput>;

export type CampaignsListResponse = CampaignListItem[];

export type CampaignsResponse = {
  campaigns: CampaignListItem[];
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
