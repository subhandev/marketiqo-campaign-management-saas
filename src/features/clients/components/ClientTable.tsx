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
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[760px]">
        {/* HEADER */}
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {[
              { label: "Client", cls: "" },
              { label: "Company", cls: "" },
              { label: "Industry", cls: "hidden lg:table-cell" },
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
              <td className="px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">
                {client.company ?? "—"}
              </td>

              {/* INDUSTRY */}
              <td className="hidden lg:table-cell px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">
                {client.industry ?? "—"}
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
                          onClick={() => router.push(`/clients/${client.id}`)}
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/clients/${client.id}?edit=true`)}
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
