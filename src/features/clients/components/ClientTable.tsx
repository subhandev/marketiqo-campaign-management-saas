"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Client } from "@/features/clients/types";
import { getInitials } from "@/shared/format/strings";
import { formatDateMedium } from "@/shared/format/dates";
import { formatRelativeTime } from "@/shared/format/dates";
import { cn } from "@/lib/utils";

interface ClientTableProps {
  clients: Client[];
  onDelete: (id: string) => void | Promise<void>;
}

export function ClientTable({ clients, onDelete }: ClientTableProps) {
  const router = useRouter();
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      setDeleting(true);
      await onDelete(clientToDelete.id);
      setClientToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
    <div className="hidden sm:block bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[760px]">
        {/* HEADER */}
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {[
              { label: "Client", cls: "" },
              { label: "Company", cls: "hidden md:table-cell" },
              { label: "Needs attention", cls: "" },
              { label: "Active", cls: "hidden md:table-cell" },
              { label: "Last activity", cls: "" },
              { label: "Email", cls: "hidden lg:table-cell" },
              { label: "Campaigns", cls: "" },
              { label: "Status", cls: "" },
              { label: "Created", cls: "hidden md:table-cell" },
              { label: "", cls: "" },
            ].map((h) => (
              <th
                key={h.label}
                className={cn(
                  "text-[11px] uppercase tracking-wider font-medium text-muted-foreground px-5 py-3 text-left",
                  h.cls,
                )}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              onClick={() => router.push(`/clients/${client.id}`)}
              className="group border-b border-border/50 hover:bg-muted/40 cursor-pointer transition-colors last:border-0"
            >
              {/* CLIENT */}
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                    {getInitials(client.name)}
                  </div>
                  <span className="text-sm font-medium truncate max-w-[160px]">
                    {client.name}
                  </span>
                </div>
              </td>

              {/* COMPANY */}
              <td className="hidden md:table-cell px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">
                {client.company ?? "—"}
              </td>

              {/* NEEDS ATTENTION */}
              <td className="px-5 py-3">
                {client.atRiskCampaignsCount && client.atRiskCampaignsCount > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                    {client.atRiskCampaignsCount} at risk
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </td>

              {/* ACTIVE CAMPAIGNS */}
              <td className="hidden md:table-cell px-5 py-3">
                <span className="text-sm font-medium">
                  {client.activeCampaignsCount ?? 0}
                </span>
              </td>

              {/* LAST ACTIVITY */}
              <td className="px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">
                {client.lastActivityAt ? formatRelativeTime(client.lastActivityAt) : "—"}
              </td>

              {/* EMAIL */}
              <td
                className="hidden lg:table-cell px-5 py-3 text-sm text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                {client.email ? (
                  <a
                    href={`mailto:${client.email}`}
                    className="hover:text-primary transition-colors truncate block max-w-[180px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {client.email}
                  </a>
                ) : (
                  "—"
                )}
              </td>

              {/* CAMPAIGNS */}
              <td
                className="px-5 py-3"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/campaigns?clientId=${client.id}`);
                }}
              >
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium w-6 h-6">
                  {client._count?.campaigns ?? 0}
                </span>
              </td>

              {/* STATUS */}
              <td className="px-5 py-3">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                    client.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-zinc-100 text-zinc-500 border-zinc-200",
                  )}
                >
                  {client.status}
                </span>
              </td>

              {/* CREATED */}
              <td className="hidden md:table-cell px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">
                {formatDateMedium(client.createdAt)}
              </td>

              {/* ACTIONS */}
              <td
                className="px-5 py-3 text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => router.push(`/clients/${client.id}`)}
                  >
                    View <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>

                  <div className="opacity-100 transition">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/campaigns/new?clientId=${client.id}`)}
                        >
                          Add campaign
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/clients/${client.id}`)}
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/clients/${client.id}/edit`)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setClientToDelete(client)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
    <div className="mt-3 space-y-2 sm:hidden">
      {clients.map((client) => (
        <button
          key={client.id}
          type="button"
          onClick={() => router.push(`/clients/${client.id}`)}
          className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/20"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(client.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{client.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {client.company ?? "—"}
                  </p>
                </div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {client.lastActivityAt ? formatRelativeTime(client.lastActivityAt) : "—"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {client.atRiskCampaignsCount && client.atRiskCampaignsCount > 0 ? (
              <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                {client.atRiskCampaignsCount} at risk
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">No risks</span>
            )}

            <span className="inline-flex items-center rounded-full border border-border bg-muted/35 px-2 py-0.5 text-[11px] font-medium text-foreground">
              Active {client.activeCampaignsCount ?? 0}
            </span>

            <span
              className="inline-flex items-center rounded-full border border-border bg-muted/20 px-2 py-0.5 text-[11px] font-medium text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/campaigns?clientId=${client.id}`);
              }}
            >
              Campaigns {client._count?.campaigns ?? 0}
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-between"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/campaigns/new?clientId=${client.id}`);
              }}
            >
              Add campaign <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </button>
      ))}
    </div>
    <ConfirmModal
      open={!!clientToDelete}
      title="Delete client?"
      description={`This will permanently delete "${clientToDelete?.name ?? "this client"}" and all associated campaigns, metrics, and insights. This action cannot be undone.`}
      confirmLabel="Delete Client"
      loadingLabel="Deleting..."
      loading={deleting}
      onConfirm={handleConfirmDelete}
      onCancel={() => {
        if (!deleting) setClientToDelete(null);
      }}
    />
    </>
  );
}
