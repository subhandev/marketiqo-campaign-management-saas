// src/server/clients/clients.handler.ts

import { NextRequest, NextResponse } from "next/server";
import {
  listClients,
  getClient,
  addClient,
  editClient,
  removeClient,
} from "@/server/clients/clients.service";
import { createClientSchema } from "@/features/clients/schemas";

export async function handleListClients(workspaceId: string) {
  try {
    const data = await listClients(workspaceId);
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function handleGetClient(id: string, workspaceId: string) {
  try {
    const data = await getClient(id, workspaceId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Client not found") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

export async function handleCreateClient(
  req: NextRequest,
  workspaceId: string
) {
  try {
    const body = createClientSchema.parse(await req.json());
    const data = await addClient(workspaceId, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}

export async function handleUpdateClient(
  req: NextRequest,
  id: string,
  workspaceId: string
) {
  try {
    const body = createClientSchema.parse(await req.json());
    const data = await editClient(id, workspaceId, body);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Client not found") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function handleDeleteClient(id: string, workspaceId: string) {
  try {
    const data = await removeClient(id, workspaceId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Client not found") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}