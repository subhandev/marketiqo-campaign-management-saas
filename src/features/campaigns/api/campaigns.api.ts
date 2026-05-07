import {
  CampaignListItem,
  CampaignResponse,
  CreateCampaignInput,
  UpdateCampaignInput,
  Metric,
  CreateMetricInput,
  Insight,
} from "@/features/campaigns/types";

const BASE_URL = "/api/campaigns";

export async function getCampaigns(): Promise<CampaignListItem[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  return res.json();
}


export async function fetchCampaign(id: string): Promise<CampaignResponse> {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch campaign");
  return res.json();
}

export async function generateInsight(id: string): Promise<{ insight: string }> {
  const res = await fetch(`${BASE_URL}/${id}/insights`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to generate insight");
  return res.json();
}

export async function createCampaign(data: CreateCampaignInput): Promise<CampaignResponse> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? error.error ?? "Failed to create campaign");
  }
  return res.json();
}

export async function updateCampaign(id: string, data: UpdateCampaignInput): Promise<CampaignResponse> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? error.error ?? "Failed to update campaign");
  }
  return res.json();
}

export async function deleteCampaign(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete campaign");
  return res.json();
}

export async function createMetric(
  campaignId: string,
  data: CreateMetricInput
): Promise<{ metric: Metric }> {
  const res = await fetch(`/api/campaigns/${campaignId}/metrics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? error.error ?? "Failed to save metrics");
  }

  return res.json();
}

export async function fetchMetrics(campaignId: string): Promise<Metric[]> {
  const res = await fetch(`/api/campaigns/${campaignId}/metrics`);
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}

export async function fetchInsights(campaignId: string): Promise<Insight[]> {
  const res = await fetch(`${BASE_URL}/${campaignId}/insights`);
  if (!res.ok) throw new Error("Failed to fetch insights");
  const data = await res.json();
  return data.insights;
}
