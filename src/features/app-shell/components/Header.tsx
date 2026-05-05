"use client";

import { Search, Bell, CircleHelp } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fullName = user?.fullName ?? user?.username ?? "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="h-14 px-6 flex items-center justify-between sticky top-0 z-10 border-b border-[hsl(var(--border))] backdrop-blur-sm"
      style={{ background: "hsl(var(--background) / 0.85)" }}
    >
      {/* Left */}
      <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 h-10 w-80 focus-within:bg-background focus-within:ring-1 focus-within:ring-ring transition-colors">
        <Search size={14} className="text-[hsl(var(--muted-foreground))] shrink-0" />
        <input
          placeholder="Search..."
          className="bg-transparent text-sm outline-none flex-1"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">        
        <button className="w-8 h-8 flex items-center justify-center">
          <CircleHelp size={16} />
        </button>

        <div className="relative">
          <Bell size={16} />
        </div>

        <div className="w-px h-6 bg-[hsl(var(--border))] mx-1" />

        {/* Profile */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2.5 hover:bg-[hsl(var(--muted))] px-2 py-1 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              {initials}
            </div>

            <div className="flex flex-col text-left">
              <span className="text-sm font-medium">{fullName}</span>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                Admin
              </span>
            </div>
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-md p-1 z-50">
              <button
                onClick={() => router.push("/settings")}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-[hsl(var(--muted))]"
              >
                Settings
              </button>

              <button
                onClick={() => signOut(() => router.push("/sign-in"))}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-red-50 text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}