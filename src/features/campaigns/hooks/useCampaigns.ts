import { useState, useEffect, useCallback } from "react";
import {
  getCampaigns,
  fetchCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  generateInsight,
} from "@/features/campaigns/api/campaigns.api";
import {
  CampaignListItem,
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "@/features/campaigns/types";

export function useCampaignList() {
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await getCampaigns();
        setCampaigns(data.campaigns);

        const needsInsight = data.campaigns.filter((c) => {
          if (!c.latestMetric) return false;
          if (!c.latestInsight) return true;
          return new Date(c.latestMetric.date) > new Date(c.latestInsight.createdAt);
        });

        if (needsInsight.length > 0) {
          setGeneratingIds(new Set(needsInsight.map((c) => c.id)));

          Promise.all(
            needsInsight.map(async (c) => {
              try {
                const result = await generateInsight(c.id);
                setCampaigns((prev) =>
                  prev.map((campaign) =>
                    campaign.id === c.id
                      ? {
                          ...campaign,
                          latestInsight: {
                            content: result.insight,
                            createdAt: new Date().toISOString(),
                          },
                        }
                      : campaign
                  )
                );
              } catch {
                // silently ignore per-campaign insight failures
              } finally {
                setGeneratingIds((prev) => {
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

  return { campaigns, isLoading, error, generatingIds };
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCampaigns();
      setCampaigns(data.campaigns);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  return { campaigns, total, loading, error, refresh: load };
}

export function useCampaign(id: string) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCampaign(id);
      setCampaign(data.campaign);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);
  return { campaign, loading, error, refresh: load };
}

export function useCampaignMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateCampaignInput) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createCampaign(data);
      return res.campaign;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create campaign";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: UpdateCampaignInput) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updateCampaign(id, data);
      return res.campaign;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update campaign";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCampaign(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete campaign";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, update, remove, loading, error };
}
