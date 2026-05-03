import {
  CampaignsResponse,
  CampaignResponse,
  CreateCampaignInput,
  UpdateCampaignInput,
  Metric,
  CreateMetricInput,
} from "@/features/campaigns/types";

const BASE_URL = "/api/campaigns";

export async function fetchCampaigns(): Promise<CampaignsResponse> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  return res.json();
}

export async function fetchCampaign(id: string): Promise<CampaignResponse> {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch campaign");
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
    throw new Error(error.message ?? "Failed to create campaign");
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
    throw new Error(error.message ?? "Failed to update campaign");
  }
  return res.json();
}

export async function deleteCampaign(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete campaign");
  return res.json();
}

// ── Metrics ─────────────────────────────────────────



export async function createMetric(
  campaignId: string,
  data: CreateMetricInput
): Promise<Metric> {
  const res = await fetch(`/api/campaigns/${campaignId}/metrics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? "Failed to save metrics");
  }

  return res.json();
}

export async function fetchMetrics(
  campaignId: string
): Promise<Metric[]> {
  const res = await fetch(`/api/campaigns/${campaignId}/metrics`);

  if (!res.ok) {
    throw new Error("Failed to fetch metrics");
  }

  return res.json();
}