"use client";

import { Search, Bell, CircleHelp, Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function Header() {
  const { user } = useUser();
  const router = useRouter();

  const fullName = user?.fullName ?? user?.username ?? "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="bg-white border-b border-border h-14 px-6 flex items-center justify-between">
      {/* Left — Search */}
      <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 h-9 w-[340px]">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <input
          placeholder="Search campaigns, clients, tasks..."
          className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground"
        />
        <kbd className="bg-muted border border-border text-muted-foreground text-[10px] px-1.5 py-0.5 rounded shrink-0">
          ⌘K
        </kbd>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <CircleHelp className="h-[18px] w-[18px]" />
        </button>

        <div className="relative">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-[18px] w-[18px]" />
          </button>
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full pointer-events-none" />
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-zinc-800 text-white text-xs flex items-center justify-center font-medium shrink-0">
            {initials}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">{fullName}</span>
            <span className="text-[10px] text-muted-foreground">Admin</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/campaigns/new")}
          className="bg-black text-white text-sm font-medium px-4 h-9 rounded-lg hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Campaign
        </button>
      </div>
    </header>
  );
}
