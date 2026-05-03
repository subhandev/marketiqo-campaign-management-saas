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
    <header
      className="h-14 px-6 flex items-center justify-between sticky top-0 z-10 border-b border-[hsl(var(--border))] backdrop-blur-sm"
      style={{ background: "hsl(var(--background) / 0.85)" }}
    >
      {/* Left — search */}
      <div className="flex items-center gap-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg px-3 h-9 w-80">
        <Search
          size={14}
          className="text-[hsl(var(--muted-foreground))] shrink-0"
        />
        <input
          placeholder="Search campaigns, clients, tasks..."
          className="bg-transparent text-sm outline-none flex-1 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
        />
        <kbd className="ml-auto text-[10px] text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] border border-[hsl(var(--border))] px-1.5 py-0.5 rounded font-mono shrink-0">
          ⌘K
        </kbd>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/campaigns/new")}
          className="ml-2 h-9 px-4 rounded-lg bg-gradient-brand text-white text-sm font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={14} />
          New Campaign
        </button>

        <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[hsl(var(--muted))] transition-colors">
          <CircleHelp
            size={16}
            className="text-[hsl(var(--muted-foreground))]"
          />
        </button>

        <div className="relative">
          <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[hsl(var(--muted))] transition-colors">
            <Bell size={16} className="text-[hsl(var(--muted-foreground))]" />
          </button>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full pointer-events-none" />
        </div>

        <div className="w-px h-6 bg-[hsl(var(--border))] mx-1" />

        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            {initials}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
              {fullName}
            </span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
