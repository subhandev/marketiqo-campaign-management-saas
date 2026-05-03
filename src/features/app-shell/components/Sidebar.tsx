"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  CheckSquare,
  Calendar,
  BarChart2,
  Sparkles,
  UsersRound,
  FileText,
  Plug,
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  disabled?: boolean;
};

const workspaceEnabled: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Clients", icon: Users, href: "/clients" },
  { label: "Campaigns", icon: Megaphone, href: "/campaigns" },
  { label: "AI Reports", icon: Sparkles, href: "/ai-reports", badge: "AI" },
];

const workspaceSoon: NavItem[] = [
  { label: "Tasks", icon: CheckSquare, href: "/tasks", disabled: true },
  { label: "Calendar", icon: Calendar, href: "/calendar", disabled: true },
  { label: "Reports", icon: BarChart2, href: "/reports", disabled: true },
];

const manageNav: NavItem[] = [
  { label: "Team", icon: UsersRound, href: "/team", disabled: true },
  { label: "Documents", icon: FileText, href: "/documents", disabled: true },
  { label: "Integrations", icon: Plug, href: "/integrations", disabled: true },
  { label: "Settings", icon: Settings2, href: "/settings", disabled: true },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const navItemClass = (active: boolean, disabled?: boolean) =>
    cn(
      "flex items-center gap-2.5 py-2 rounded-lg text-sm transition-colors mx-1",
      collapsed ? "justify-center px-0" : "px-3",
      disabled && "opacity-40 cursor-not-allowed pointer-events-none",
      !disabled && active && "bg-[hsl(var(--sidebar-accent))] text-white font-medium",
      !disabled && !active &&
        "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent)/0.6)] hover:text-white cursor-pointer"
    );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full flex flex-col z-20 overflow-hidden",
        "bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]",
        "transition-[width] duration-200 ease-in-out",
        collapsed ? "w-14" : "w-64"
      )}
    >
      {/* Logo + toggle */}
      <div
        className={cn(
          "pt-4 pb-3 flex items-center shrink-0",
          collapsed ? "justify-center px-2" : "justify-between px-3"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
            <Sparkles className="text-white" size={14} />
          </div>
          {!collapsed && (
            <div className="flex flex-col ml-0.5 overflow-hidden">
              <span className="text-sm font-semibold text-white leading-tight truncate">
                Marketiqo
              </span>
              <span
                className="text-[10px] leading-tight truncate"
                style={{ color: "hsl(var(--sidebar-foreground) / 0.55)" }}
              >
                AI Marketing Suite
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[hsl(var(--sidebar-accent))] transition-colors shrink-0"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.7)" }}
          >
            <PanelLeftClose size={14} />
          </button>
        )}
      </div>

      {/* Collapsed toggle */}
      {collapsed && (
        <div className="flex justify-center px-2 pb-2 shrink-0">
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[hsl(var(--sidebar-accent))] transition-colors mx-auto"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.7)" }}
          >
            <PanelLeftOpen size={14} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-1 pb-2">
        {/* WORKSPACE — enabled */}
        {!collapsed && (
          <p
            className="text-[10px] uppercase tracking-widest font-medium px-3 mt-5 mb-1.5"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.4)" }}
          >
            Workspace
          </p>
        )}
        {collapsed && <div className="mt-4" />}

        {workspaceEnabled.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.label} href={item.href} className={navItemClass(active)}>
              <Icon size={15} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full text-white font-medium shrink-0"
                      style={{ background: "hsl(var(--brand))" }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}

        {workspaceSoon.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={navItemClass(false, true)}>
              <Icon size={15} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  <span
                    className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
                    style={{
                      background: "hsl(var(--sidebar-border))",
                      color: "hsl(var(--sidebar-foreground) / 0.6)",
                    }}
                  >
                    Soon
                  </span>
                </>
              )}
            </div>
          );
        })}

        {/* MANAGE */}
        {!collapsed && (
          <p
            className="text-[10px] uppercase tracking-widest font-medium px-3 mt-5 mb-1.5"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.4)" }}
          >
            Manage
          </p>
        )}
        {collapsed && <div className="mt-4" />}

        {manageNav.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={navItemClass(false, true)}>
              <Icon size={15} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  <span
                    className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
                    style={{
                      background: "hsl(var(--sidebar-border))",
                      color: "hsl(var(--sidebar-foreground) / 0.6)",
                    }}
                  >
                    Soon
                  </span>
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* Upgrade card — expanded only */}
      {!collapsed && (
        <div className="mx-2 mb-3 mt-auto shrink-0">
          <div
            className="rounded-xl p-3 border border-[hsl(var(--sidebar-border))]"
            style={{
              background:
                "linear-gradient(135deg, hsl(230 50% 18%), hsl(260 45% 16%))",
            }}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} style={{ color: "hsl(var(--brand))" }} />
              <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
            </div>
            <p
              className="text-[11px] mt-1 leading-snug"
              style={{ color: "hsl(var(--sidebar-foreground) / 0.65)" }}
            >
              Unlock unlimited AI reports & insights.
            </p>
            <button className="w-full mt-2 h-8 rounded-lg bg-gradient-brand text-white text-xs font-medium hover:opacity-90 transition-opacity">
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
