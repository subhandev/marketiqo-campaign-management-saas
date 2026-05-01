// src/features/clients/api/clients.api.ts

import {
  Client,
  ClientsResponse,
  ClientResponse,
  CreateClientInput,
  UpdateClientInput,
} from "@/features/clients/types";

const BASE_URL = "/api/clients";

export async function fetchClients(): Promise<ClientsResponse> {
  const res = await fetch(BASE_URL);

  if (!res.ok) {
    throw new Error("Failed to fetch clients");
  }

  return res.json();
}

export async function fetchClient(id: string): Promise<ClientResponse> {
  const res = await fetch(`${BASE_URL}/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch client");
  }

  return res.json();
}

export async function createClient(
  data: CreateClientInput
): Promise<ClientResponse> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? "Failed to create client");
  }

  return res.json();
}

export async function updateClient(
  id: string,
  data: UpdateClientInput
): Promise<ClientResponse> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? "Failed to update client");
  }

  return res.json();
}

export async function deleteClient(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete client");
  }

  return res.json();
}