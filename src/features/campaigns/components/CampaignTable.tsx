"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Campaign, CampaignStatus } from "@/features/campaigns/types";
import { cn } from "@/lib/utils";

interface CampaignTableProps {
  campaigns: Campaign[];
  onDelete: (id: string) => void;
}

const statusStyles: Record<CampaignStatus, string> = {
  planned:   "bg-blue-50 text-blue-700 border-blue-200",
  active:    "bg-green-50 text-green-700 border-green-200",
  at_risk:   "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-zinc-100 text-zinc-500 border-zinc-200",
  archived:  "bg-zinc-100 text-zinc-400 border-zinc-200",
};

const statusLabel: Record<CampaignStatus, string> = {
  planned:   "Planned",
  active:    "Active",
  at_risk:   "At Risk",
  completed: "Completed",
  archived:  "Archived",
};

export function CampaignTable({ campaigns, onDelete }: CampaignTableProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border">
          <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Campaign
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Client
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Platform
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Status
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Deadline
          </TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => (
          <TableRow
            key={campaign.id}
            className="hover:bg-muted/40 cursor-pointer border-border transition-colors"
            onClick={() => router.push(`/campaigns/${campaign.id}`)}
          >
            {/* Campaign */}
            <TableCell>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium">{campaign.name}</span>
                {campaign.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                    {campaign.description}
                  </span>
                )}
              </div>
            </TableCell>

            {/* Client */}
            <TableCell>
              {campaign.client ? (
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium">
                    {campaign.client.name}
                  </span>
                  {campaign.client.industry && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium w-fit mt-0.5">
                      {campaign.client.industry}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </TableCell>

            {/* Platform */}
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {campaign.platform}
              </span>
            </TableCell>

            {/* Status */}
            <TableCell>
              <span
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium border",
                  statusStyles[campaign.status]
                )}
              >
                {statusLabel[campaign.status]}
              </span>
            </TableCell>

            {/* Deadline */}
            <TableCell>
              {campaign.deadline ? (
                <span className="text-sm text-muted-foreground">
                  {new Date(campaign.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </TableCell>

            {/* Actions */}
            <TableCell
              className="text-right"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                >
                  View <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    >
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(`/campaigns/${campaign.id}?edit=true`)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(campaign.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
