// src/features/app-shell/components/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  CheckSquare,
  Calendar,
  BarChart3,
  Sparkles,
  Users2,
  FileText,
  Plug,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mainNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Clients", icon: Users, href: "/clients" },
  { label: "Campaigns", icon: Megaphone, href: "/campaigns" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { label: "Calendar", icon: Calendar, href: "/calendar" },
  { label: "Reports", icon: BarChart3, href: "/reports" },
  { label: "AI Reports", icon: Sparkles, href: "/ai-reports" },
];

const managementNav = [
  { label: "Team", icon: Users2, href: "/team" },
  { label: "Documents", icon: FileText, href: "/documents" },
  { label: "Integrations", icon: Plug, href: "/integrations" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        border-r bg-sidebar flex flex-col py-4
        transition-all duration-200
        ${collapsed ? "w-16 px-2" : "w-64 px-3"}
      `}
    >
      {/* Logo */}
      <div className={`mb-6 ${collapsed ? "flex justify-center" : "px-2"}`}>
        {!collapsed ? (
          <h2 className="text-sm font-semibold tracking-tight">
            Marketiqo
          </h2>
        ) : (
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white text-xs font-bold">
            AI
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-lg transition-all
                  text-sm font-normal leading-5 tracking-tight
                  ${collapsed ? "justify-center" : "gap-2"}
                  ${
                    active
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }
                `}
              >
                <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-sidebar-border" />

        {/* Management */}
        <div className="space-y-2">
          {!collapsed && (
            <div className="px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Management
            </div>
          )}
          {managementNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-lg transition-all
                  text-sm font-normal leading-5 tracking-tight
                  ${collapsed ? "justify-center" : "gap-2"}
                  ${
                    active
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }
                `}
              >
                <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-auto pt-6">
        {!collapsed ? (
          <div className="rounded-lg border border-sidebar-border p-4 space-y-2 bg-muted/40">
            <p className="text-sm font-medium tracking-tight">Upgrade to Pro</p>
            <p className="text-xs text-muted-foreground leading-5">
              Unlock advanced insights and reports
            </p>
            <Button size="sm" className="w-full">
              Upgrade Now
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button size="icon" variant="ghost">
              <Sparkles className="h-4 w-4 text-primary" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}