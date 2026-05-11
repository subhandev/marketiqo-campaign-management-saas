import type { DashboardData, PortfolioAiBrief } from "@/features/dashboard/types";

const BASE = "/api/dashboard";

/**
 * Loads dashboard stats and lists. Returns `null` when the user is unauthorized (401).
 * Throws on other failures or non-JSON responses.
 */
export async function fetchDashboard(): Promise<DashboardData | null> {
  const res = await fetch(BASE);
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Unexpected response type");
  }

  return res.json() as Promise<DashboardData>;
}

export async function requestPortfolioAiBrief(): Promise<PortfolioAiBrief> {
  const response = await fetch(`${BASE}/insights`, { method: "POST" });
  const payload = await response.json();

  if (!response.ok) {
    const err =
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as { error?: unknown }).error ?? "")
        : "";
    throw new Error(err || "Failed to generate dashboard insights.");
  }

  return payload as PortfolioAiBrief;
}
