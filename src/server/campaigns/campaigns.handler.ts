import { NextRequest, NextResponse } from "next/server";
import {
  getCampaignList,
  listCampaignItems,
  generateQuickInsight,
  getCampaign,
  addCampaign,
  editCampaign,
  removeCampaign,
  addMetric,
  listMetrics,
  listInsights,
} from "@/server/campaigns/campaigns.service";
import {
  createCampaignSchema,
  createMetricSchema,
  updateCampaignSchema,
} from "@/server/campaigns/campaigns.schemas";

export async function handleGetCampaignList(workspaceId: string) {
  try {
    const campaigns = await getCampaignList(workspaceId);
    return NextResponse.json(campaigns, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function handleListCampaigns(workspaceId: string) {
  try {
    const data = await listCampaignItems(workspaceId);
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function handleGenerateQuickInsight(campaignId: string, workspaceId: string) {
  try {
    const data = await generateQuickInsight(campaignId, workspaceId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Campaign not found")
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 });
  }
}

export async function handleGetCampaign(id: string, workspaceId: string) {
  try {
    const data = await getCampaign(id, workspaceId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Campaign not found")
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function handleCreateCampaign(req: NextRequest, workspaceId: string) {
  try {
    const body = createCampaignSchema.parse(await req.json());
    const data = await addCampaign(workspaceId, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}

export async function handleUpdateCampaign(req: NextRequest, id: string, workspaceId: string) {
  try {
    const body = updateCampaignSchema.parse(await req.json());
    const data = await editCampaign(id, workspaceId, body);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Campaign not found")
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function handleDeleteCampaign(id: string, workspaceId: string) {
  try {
    const data = await removeCampaign(id, workspaceId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Campaign not found")
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}

export async function handleCreateMetric(
  req: NextRequest,
  campaignId: string,
  workspaceId: string
) {
  try {
    const body = createMetricSchema.parse(await req.json());
    const data = await addMetric(campaignId, workspaceId, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Campaign not found")
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    if (error instanceof Error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Failed to save metric" }, { status: 500 });
  }
}

export async function handleListMetrics(campaignId: string, workspaceId: string) {
  try {
    const data = await listMetrics(campaignId, workspaceId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Campaign not found")
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}

export async function handleListInsights(campaignId: string, workspaceId: string) {
  try {
    const data = await listInsights(campaignId, workspaceId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Campaign not found")
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
