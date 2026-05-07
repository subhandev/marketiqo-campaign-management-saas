import { resetWorkspaceData } from "./settings.service";

export async function handleResetWorkspaceData(clerkUserId: string) {
  try {
    const result = await resetWorkspaceData(clerkUserId);
    return {
      status: 200,
      body: {
        success: true,
        ...result,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset data";

    return {
      status: message.includes("not found") ? 404 : 500,
      body: { error: message },
    };
  }
}
