"use client";

import { cn } from "@/lib/utils";
import { CampaignStatus } from "@/features/campaigns/types";
import { CAMPAIGN_STATUS_CONFIG } from "@/features/campaigns/utils/status";

interface CampaignStatusBadgeProps {
  status: CampaignStatus | string;
  withDot?: boolean;
  className?: string;
}

export function CampaignStatusBadge({
  status,
  withDot = true,
  className,
}: CampaignStatusBadgeProps) {
  const cfg = CAMPAIGN_STATUS_CONFIG[status as CampaignStatus] ?? {
    label: status,
    bg: "bg-zinc-100 text-zinc-500 border-zinc-200",
    dot: "bg-zinc-400",
    accent: "bg-transparent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border",
        cfg.bg,
        className,
      )}
    >
      {withDot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)} />}
      {cfg.label}
    </span>
  );
}
