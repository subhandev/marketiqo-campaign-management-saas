// src/app/(dashboard)/clients/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientTable } from "@/features/clients/components/ClientTable";
import { useClients, useClientMutations } from "@/features/clients/hooks/useClients";

export default function ClientsPage() {
  const router = useRouter();
  const { clients, total, loading, error, refresh } = useClients();
  const { remove } = useClientMutations();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = clients
    .filter((c) => {
      if (filter === "active") return c.status === "active";
      if (filter === "inactive") return c.status === "inactive";
      return true;
    })
    .filter((c) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q)
      );
    });

  const handleDelete = async (id: string) => {
    await remove(id);
    refresh();
  };

  // Empty State
  if (!loading && clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">No clients yet</h2>
          <p className="text-sm text-muted-foreground">
            Start by adding your first client to manage their campaigns and track results.
          </p>
        </div>
        <Button onClick={() => router.push("/clients/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your clients and their campaigns
          </p>
        </div>
        <Button onClick={() => router.push("/clients/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center justify-between gap-4">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as typeof filter)}
        >
          <TabsList>
            <TabsTrigger value="all">
              All
              <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {clients.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="active">
              Active
              <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {clients.filter((c) => c.status === "active").length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive
              <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {clients.filter((c) => c.status === "inactive").length}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs h-9"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">Loading clients...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">
            No clients match your search.
          </p>
        </div>
      ) : (
        <ClientTable clients={filtered} onDelete={handleDelete} />
      )}
    </div>
  );
}