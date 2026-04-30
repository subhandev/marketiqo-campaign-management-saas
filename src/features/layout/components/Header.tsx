"use client";

import { Menu, Search, Bell, HelpCircle, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="h-14 border-b bg-background flex items-center justify-between pr-4 pl-14">
      {/* LEFT */}
      <div className="flex items-center gap-3 w-full max-w-md">
        {/* Search */}
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

        {/* User */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted cursor-pointer">
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            S
          </div>

          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium tracking-tight">Subhan</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>

          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
