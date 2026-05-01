// src/server/clients/clients.service.ts

import {
  getClientsByWorkspace,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "@/server/clients/clients.repository";
import { CreateClientInput, UpdateClientInput } from "@/features/clients/types";

export async function listClients(workspaceId: string) {
  const clients = await getClientsByWorkspace(workspaceId);
  return {
    clients,
    total: clients.length,
  };
}

export async function getClient(id: string, workspaceId: string) {
  const client = await getClientById(id, workspaceId);

  if (!client) {
    throw new Error("Client not found");
  }

  return { client };
}

export async function addClient(
  workspaceId: string,
  data: CreateClientInput
) {
  if (!data.name || data.name.trim() === "") {
    throw new Error("Client name is required");
  }

  const client = await createClient(workspaceId, data);
  return { client };
}

export async function editClient(
  id: string,
  workspaceId: string,
  data: UpdateClientInput
) {
  const existing = await getClientById(id, workspaceId);

  if (!existing) {
    throw new Error("Client not found");
  }

  const client = await updateClient(id, workspaceId, data);
  return { client };
}

export async function removeClient(id: string, workspaceId: string) {
  const existing = await getClientById(id, workspaceId);

  if (!existing) {
    throw new Error("Client not found");
  }

  await deleteClient(id, workspaceId);
  return { success: true };
}