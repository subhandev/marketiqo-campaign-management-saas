// src/features/clients/hooks/useClients.ts

import { useState, useEffect, useCallback } from "react";
import {
  fetchClients,
  fetchClient,
  createClient,
  updateClient,
  deleteClient,
} from "@/features/clients/api/clients.api";
import {
  Client,
  ClientInsight,
  CreateClientInput,
  UpdateClientInput,
} from "@/features/clients/types";

// ── List Hook ──────────────────────────────────────────────

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchClients();
      setClients(data.clients);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timeout);
  }, [load]);

  return { clients, total, loading, error, refresh: load };
}

// ── Single Client Hook ─────────────────────────────────────

export function useClient(id: string) {
  const [client, setClient] = useState<Client | null>(null);
  const [insights, setInsights] = useState<ClientInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchClient(id);
      setClient(data.client);
      setInsights(data.insights ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timeout);
  }, [load]);

  return { client, insights, loading, error, refresh: load };
}

// ── Mutations Hook ─────────────────────────────────────────

export function useClientMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateClientInput) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createClient(data);
      return res.client;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create client";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: UpdateClientInput) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updateClient(id, data);
      return res.client;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update client";
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
      await deleteClient(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete client";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, update, remove, loading, error };
}