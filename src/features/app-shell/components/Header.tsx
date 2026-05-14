"use client";

import { Bell, CircleHelp, PanelLeftOpen } from "lucide-react";
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

export function Header({
  onMobileMenuClick,
}: {
  onMobileMenuClick?: () => void;
}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const fullName = user?.fullName ?? user?.username ?? "User";
  const displayName = user?.firstName ?? user?.username ?? "User";
  const initials = getInitials(fullName);

  return (
    <header
      className="h-14 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-10 border-b border-border backdrop-blur-sm"
      style={{ background: "hsl(var(--background) / 0.85)" }}
    >
      {/* Left */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onMobileMenuClick}
          className="md:hidden w-9 h-9 rounded-lg border border-border bg-background/60 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
          aria-label="Open navigation"
        >
          <PanelLeftOpen size={16} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="hidden sm:flex w-8 h-8 items-center justify-center">
          <CircleHelp size={16} />
        </button>

        <div className="hidden sm:block relative">
          <Bell size={16} />
        </div>

        <div className="hidden sm:block w-px h-6 bg-border mx-1" />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded-lg max-w-[11rem]">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                {initials}
              </div>
              <div className="hidden sm:flex flex-col text-left min-w-0">
                <span className="text-sm font-medium truncate">{displayName}</span>
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
              variant="destructive"
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
