"use client";

import { useState, useEffect, useMemo } from "react";
import { getCampaigns, generateInsight } from "@/features/campaigns/api/campaigns.api";
import { CampaignListItem } from "@/features/campaigns/types";

export function useCampaignList() {
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [loadingInsights, setLoadingInsights] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await getCampaigns();
        setCampaigns(data);

        const stale = data.filter((c) => {
          if (c._count.metrics === 0) return false;
          if (!c.latestInsight) return true;
          if (!c.latestMetric) return false;
          return new Date(c.latestMetric.recordedAt) > new Date(c.latestInsight.createdAt);
        });

        if (stale.length > 0) {
          setLoadingInsights(new Set(stale.map((c) => c.id)));

          Promise.all(
            stale.map(async (c) => {
              try {
                const result = await generateInsight(c.id);
                setCampaigns((prev) =>
                  prev.map((campaign) =>
                    campaign.id === c.id
                      ? {
                          ...campaign,
                          latestInsight: {
                            id: `optimistic-${c.id}`,
                            content: result.insight,
                            createdAt: new Date().toISOString(),
                          },
                        }
                      : campaign
                  )
                );
              } catch {
                // silently ignore — do not break UI
              } finally {
                setLoadingInsights((prev) => {
                  const next = new Set(prev);
                  next.delete(c.id);
                  return next;
                });
              }
            })
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load campaigns");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const counts = useMemo(
    () => ({
      all: campaigns.length,
      needs_attention: campaigns.filter((c) => c.status === "at_risk").length,
      active: campaigns.filter((c) => c.status === "active").length,
      planned: campaigns.filter((c) => c.status === "planned").length,
      completed: campaigns.filter((c) => c.status === "completed").length,
    }),
    [campaigns]
  );

  const clientList = useMemo(() => {
    const seen = new Set<string>();
    return campaigns
      .map((c) => c.client)
      .filter((c) => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
  }, [campaigns]);

  return { campaigns, isLoading, loadingInsights, error, counts, clientList };
}
