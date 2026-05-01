export type CampaignStatus = "planned" | "active" | "at_risk" | "completed" | "archived";

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
