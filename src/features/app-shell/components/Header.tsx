"use client";

import { Search, Bell, CircleHelp } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/shared/format/strings";

export function Header() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const fullName = user?.fullName ?? user?.username ?? "User";
  const initials = getInitials(fullName);

  return (
    <header
      className="h-14 px-6 flex items-center justify-between sticky top-0 z-10 border-b border-border backdrop-blur-sm"
      style={{ background: "hsl(var(--background) / 0.85)" }}
    >
      {/* Left */}
      <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 h-10 w-80 focus-within:bg-background focus-within:ring-1 focus-within:ring-ring transition-colors">
        <Search size={14} className="text-muted-foreground shrink-0" />
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

        <div className="w-px h-6 bg-border mx-1" />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 hover:bg-muted px-2 py-1 rounded-lg">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                {initials}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium">{fullName}</span>
                <span className="text-[10px] text-muted-foreground">Admin</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => signOut(() => router.push("/sign-in"))}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
