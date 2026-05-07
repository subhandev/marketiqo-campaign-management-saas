import {
  clearWorkspaceData,
  deleteWorkspace,
  findActiveDemoWorkspace,
  findRealWorkspace,
  findUserByClerkId,
  markDemoCleared,
} from "./settings.repository";

type ResetResult = {
  resetMode: "demo" | "real";
};

export async function resetWorkspaceData(clerkUserId: string): Promise<ResetResult> {
  const user = await findUserByClerkId(clerkUserId);
  if (!user) {
    throw new Error("User not found");
  }

  const demoWorkspace = !user.demoClearedAt
    ? await findActiveDemoWorkspace(user.id)
    : null;

  if (demoWorkspace) {
    await clearWorkspaceData(demoWorkspace.id);
    await deleteWorkspace(demoWorkspace.id);
    await markDemoCleared(clerkUserId);
    return { resetMode: "demo" };
  }

  const realWorkspace = await findRealWorkspace(user.id);
  if (!realWorkspace) {
    throw new Error("Workspace not found");
  }

  await clearWorkspaceData(realWorkspace.id);
  return { resetMode: "real" };
}
