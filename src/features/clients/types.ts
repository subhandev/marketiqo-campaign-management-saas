// src/features/clients/types.ts

export type ClientStatus = "active" | "inactive";

export type Campaign = {
  id: string;
  clientId: string;
  name: string;
  platform: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};

export type ClientInsight = {
  id: string;
  campaignId: string;
  type: string;
  content: string;
  score: number | null;
  createdAt: string;
};

export type Client = {
  id: string;
  workspaceId: string;
  name: string;
  company: string | null;
  industry: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
  activeCampaignsCount?: number;
  atRiskCampaignsCount?: number;
  lastActivityAt?: string | null;
  workspace?: {
    isDemo: boolean;
  };
  campaigns?: Campaign[];
  _count?: {
    campaigns: number;
  };
};

export type CreateClientInput = {
  name: string;
  company?: string;
  industry?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
};

export type UpdateClientInput = Partial<CreateClientInput> & {
  status?: ClientStatus;
};

export type ClientsResponse = {
  clients: Client[];
  total: number;
};

export type ClientResponse = {
  client: Client;
  insights?: ClientInsight[];
};