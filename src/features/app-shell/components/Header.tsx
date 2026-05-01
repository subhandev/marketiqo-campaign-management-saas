"use client";

import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function Header() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const fullName = user?.fullName ?? user?.username ?? "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/sign-in" });
  };

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between pr-4 pl-14">
      {/* LEFT */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns, clients, tasks..."
            className="pl-8 h-9 bg-muted/50 border-none focus-visible:ring-1"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-5 w-5" />
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted cursor-pointer">
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm font-medium tracking-tight">
                  {fullName}
                </span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm">{fullName}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
