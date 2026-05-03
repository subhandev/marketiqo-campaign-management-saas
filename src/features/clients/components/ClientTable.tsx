"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Client } from "@/features/clients/types";
import { cn } from "@/lib/utils";

interface ClientTableProps {
  clients: Client[];
  onDelete: (id: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ClientTable({ clients, onDelete }: ClientTableProps) {
  const router = useRouter();

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-card overflow-hidden">
      <table className="w-full">
        {/* HEADER */}
        <thead className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
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
                  "text-[11px] uppercase tracking-wider font-medium text-[hsl(var(--muted-foreground))] px-5 py-3 text-left",
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
              className="group border-b border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.4)] cursor-pointer transition-colors last:border-0"
            >
              {/* CLIENT */}
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                    {getInitials(client.name)}
                  </div>
                  <span className="text-sm font-medium text-[hsl(var(--foreground))] truncate max-w-[160px]">
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
                {new Date(client.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
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
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    onClick={() => router.push(`/clients/${client.id}`)}
                  >
                    View <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>

                  <div className="opacity-0 group-hover:opacity-100 transition">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
                          onClick={() => onDelete(client.id)}
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
  );
}
