"use client";

import { ChevronLast, ChevronFirst } from "lucide-react";

export function SidebarToggle({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => setCollapsed(!collapsed)}
      className={`
        absolute
        top-7
        -translate-y-1/2
        z-50
        h-6 w-6
        rounded-md
        border border-border
        bg-background
        shadow-sm
        flex items-center justify-center
        transition-all
        hover:bg-muted
        ${collapsed ? "left-[52px]" : "left-[244px]"}
      `}
    >
      {collapsed ? (
        <ChevronLast className="h-4 w-4" />
      ) : (
        <ChevronFirst className="h-4 w-4" />
      )}
    </button>
  );
}
