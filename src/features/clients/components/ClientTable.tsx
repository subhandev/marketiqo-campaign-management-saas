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

export function ClientTable({ clients, onDelete }: ClientTableProps) {
  const router = useRouter();

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-card overflow-hidden">
      <table className="w-full">
        {/* HEADER */}
        <thead className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
          <tr>
            {["Client", "Industry", "Campaigns", "Status", ""].map((h) => (
              <th
                key={h}
                className="text-[11px] uppercase tracking-wider font-medium text-[hsl(var(--muted-foreground))] px-5 py-3 text-left border-r border-[hsl(var(--border)/0.4)] last:border-none"
              >
                {h}
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
                  <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] text-xs font-semibold flex items-center justify-center">
                    {client.name[0].toUpperCase()}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                      {client.name}
                    </span>
                    {client.email && (
                      <span className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                        {client.email}
                      </span>
                    )}
                  </div>
                </div>
              </td>

              {/* INDUSTRY */}
              <td className="px-5 py-3">
                {client.industry ? (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                    {client.industry}
                  </span>
                ) : (
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    —
                  </span>
                )}
              </td>

              {/* CAMPAIGNS */}
              <td className="px-5 py-3 text-sm text-[hsl(var(--muted-foreground))]">
                {(client as any)._count?.campaigns ?? 0}
              </td>

              {/* STATUS */}
              <td className="px-5 py-3">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                    client.status === "active"
                      ? "bg-[hsl(var(--success-soft))] text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]",
                  )}
                >
                  {client.status}
                </span>
              </td>

              {/* ACTIONS */}
              <td
                className="px-5 py-3 text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-end gap-1">
                  {/* Always visible primary action */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    onClick={() => router.push(`/clients/${client.id}`)}
                  >
                    View <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>

                  {/* Secondary actions (hover only) */}
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
                          onClick={() =>
                            router.push(`/clients/${client.id}?edit=true`)
                          }
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
