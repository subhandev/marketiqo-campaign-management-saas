import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { handleResetWorkspaceData } from "@/server/settings/settings.handler";

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status, body } = await handleResetWorkspaceData(userId);
  return NextResponse.json(body, { status });
}
