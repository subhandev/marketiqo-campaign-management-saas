import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: campaignId } = await params;
  const body = await req.json();

  const { date, impressions, clicks, spend, conversions, revenue } = body;

  try {
    const metric = await prisma.metric.create({
      data: {
        campaignId,
        date: new Date(date),
        impressions: impressions ?? 0,
        clicks: clicks ?? 0,
        spend: spend ?? 0,
        conversions: conversions ?? 0,
        revenue: revenue ?? 0,
      },
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    console.error("Metric create error:", error);
    return NextResponse.json(
      { error: "Failed to create metric" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: campaignId } = await params;

  try {
    const metrics = await prisma.metric.findMany({
      where: { campaignId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    console.error("Fetch metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}