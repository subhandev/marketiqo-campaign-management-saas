"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientTable } from "@/features/clients/components/ClientTable";
import { ClientTableSkeleton } from "@/features/clients/components/ClientTableSkeleton";
import {
  useClients,
  useClientMutations,
} from "@/features/clients/hooks/useClients";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

const SORTS = [
  { value: "needs_attention", label: "Needs attention" },
  { value: "recent_activity", label: "Recent activity" },
  { value: "most_campaigns", label: "Most campaigns" },
  { value: "name_az", label: "Name (A–Z)" },
] as const;

export function ClientListView() {
  const router = useRouter();
  const { clients, loading, error, refresh } = useClients();
  const { remove } = useClientMutations();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("needs_attention");

  const statusCounts = useMemo(
    () => ({
      all: clients.length,
      active: clients.filter((c) => c.status === "active").length,
      inactive: clients.filter((c) => c.status === "inactive").length,
    }),
    [clients]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const base = clients
      .filter((client) => {
        if (filter === "active") return client.status === "active";
        if (filter === "inactive") return client.status === "inactive";
        return true;
      })
      .filter((client) => {
        if (!q) return true;
        return (
          client.name.toLowerCase().includes(q) ||
          client.email?.toLowerCase().includes(q) ||
          client.company?.toLowerCase().includes(q)
        );
      });
    
    const sorted = [...base].sort((a, b) => {
      if (sort === "needs_attention") {
        const arA = a.atRiskCampaignsCount ?? 0;
        const arB = b.atRiskCampaignsCount ?? 0;
        if (arB !== arA) return arB - arA;
        const tA = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
        const tB = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
        return tB - tA;
      }
      if (sort === "recent_activity") {
        const tA = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
        const tB = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
        return tB - tA;
      }
      if (sort === "most_campaigns") {
        const cA = a._count?.campaigns ?? 0;
        const cB = b._count?.campaigns ?? 0;
        return cB - cA;
      }
      // name_az
      return a.name.localeCompare(b.name);
    });

    return sorted;
  }, [clients, filter, search]);

  const handleDelete = async (id: string) => {
    await remove(id);
    refresh();
  };

  if (!loading && clients.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">No clients yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Start by adding your first client to manage their campaigns and
            track results.
          </p>
        </div>
        <Button onClick={() => router.push("/clients/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your clients and their campaigns
          </p>
        </div>
        <Button className="w-full sm:w-fit" onClick={() => router.push("/clients/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted/35 p-1 lg:w-fit">
          {FILTERS.map((item) => {
            const active = filter === item.value;
            const count = statusCounts[item.value];

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={cn(
                  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-card/70 hover:text-foreground"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px] leading-none",
                    active
                      ? "bg-muted text-foreground"
                      : "bg-background/80 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full lg:max-w-xs"
          />
          <Select value={sort} onValueChange={(v) => setSort(v as any)}>
            <SelectTrigger className="h-10 w-full border-border bg-muted/50 px-3 shadow-none transition-colors hover:bg-muted/70 focus-visible:bg-background sm:w-44">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              align="end"
              className="min-w-[220px] rounded-xl border border-border bg-popover p-1 shadow-lg"
            >
              {SORTS.map((s) => (
                <SelectItem
                  key={s.value}
                  className="h-9 cursor-pointer rounded-lg pl-2.5 pr-8"
                  value={s.value}
                >
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <ClientTableSkeleton />
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
