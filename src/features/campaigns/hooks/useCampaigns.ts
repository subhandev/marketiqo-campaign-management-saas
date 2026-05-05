import { useState, useEffect, useCallback } from "react";
import {
  getCampaigns,
  fetchCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "@/features/campaigns/api/campaigns.api";
import {
  CampaignListItem,
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "@/features/campaigns/types";

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
      setCampaigns(data);
      setTotal(data.length);
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
