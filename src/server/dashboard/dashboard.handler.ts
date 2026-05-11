import { NextResponse } from "next/server";
import { generatePortfolioAiBrief } from "@/server/dashboard/dashboard.service";

export async function handleGeneratePortfolioAiBrief(workspaceId: string) {
  try {
    const data = await generatePortfolioAiBrief(workspaceId);
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to generate dashboard insights" }, { status: 500 });
  }
}
