"use client";

import Image from "next/image";
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
  X,
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
];

const workspaceSoon: NavItem[] = [
  // { label: "AI Reports", icon: Sparkles, href: "/ai-reports", badge: "AI" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks", disabled: true },
  { label: "Calendar", icon: Calendar, href: "/calendar", disabled: true },
  { label: "Reports", icon: BarChart2, href: "/reports", disabled: true },
];

const manageNav: NavItem[] = [
  { label: "Team", icon: UsersRound, href: "/team", disabled: true },
  { label: "Documents", icon: FileText, href: "/documents", disabled: true },
  { label: "Integrations", icon: Plug, href: "/integrations", disabled: true },
  { label: "Settings", icon: Settings2, href: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const navItemClass = (active: boolean, disabled?: boolean) =>
    cn(
      "flex items-center gap-2.5 py-2 rounded-md text-sm transition-all mx-1",
      collapsed ? "justify-center px-0" : "px-3",

      disabled &&
        "text-[hsl(var(--sidebar-foreground)/0.5)] cursor-not-allowed",

      !disabled &&
        active &&
        "bg-[hsl(var(--sidebar-accent))] text-white font-medium",

      !disabled &&
        !active &&
        "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent)/0.4)] hover:text-white cursor-pointer",
    );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full flex flex-col z-20 overflow-hidden",
        "bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]",
        "transition-[width] duration-200 ease-in-out",
        collapsed ? "w-14" : "w-64",
        // Mobile drawer behavior
        "transform transition-transform md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      )}
    >
      {/* Logo + toggle */}
      <div
        className={cn(
          "pt-4 pb-3 flex items-center shrink-0",
          collapsed ? "justify-center px-2" : "justify-between px-3",
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center shrink-0">
            {/* <Sparkles className="text-white" size={14} /> */}

            <Image
              src="/branding/logo.svg"
              alt="Logo"
              width={48}
              height={48}
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col ml-0.5 overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">
                Marketiqo
              </span>
              <span
                className="text-[10px] truncate"
                style={{ color: "hsl(var(--sidebar-foreground) / 0.55)" }}
              >
                AI Marketing Suite
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center gap-1">
            {/* Mobile close */}
            <button
              type="button"
              onClick={onMobileClose}
              className="md:hidden w-7 h-7 rounded-md flex items-center justify-center hover:bg-[hsl(var(--sidebar-accent))]"
              style={{ color: "hsl(var(--sidebar-foreground) / 0.7)" }}
              aria-label="Close navigation"
            >
              <X size={14} />
            </button>

            {/* Desktop collapse */}
            <button
              type="button"
              onClick={onToggle}
              className="hidden md:flex w-7 h-7 rounded-md items-center justify-center hover:bg-[hsl(var(--sidebar-accent))]"
              style={{ color: "hsl(var(--sidebar-foreground) / 0.7)" }}
              aria-label="Collapse navigation"
            >
              <PanelLeftClose size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Collapsed toggle */}
      {collapsed && (
        <div className="flex justify-center px-2 pb-2">
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[hsl(var(--sidebar-accent))]"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.7)" }}
          >
            <PanelLeftOpen size={14} />
          </button>
        </div>
      )}

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-4 mt-4">
        {/* WORKSPACE */}
        {!collapsed && (
          <p
            className="text-[11px] uppercase tracking-widest font-medium px-3"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.55)" }}
          >
            Workspace
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          {workspaceEnabled.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={navItemClass(active)}
                onClick={() => onMobileClose?.()}
              >
                <Icon size={15} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className="ml-auto text-[10px] px-2 py-0.5 rounded-md text-white font-semibold tracking-wide"
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
        </div>

        {/* SOON */}
        <div className="flex flex-col gap-1.5">
          {workspaceSoon.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={navItemClass(false, true)}>
                <Icon size={15} className="shrink-0 opacity-60" />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-[hsl(var(--sidebar-border))] mx-2 mb-4" />

        {/* MANAGE */}
        {!collapsed && (
          <p
            className="text-[11px] uppercase tracking-widest font-medium px-3"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.55)" }}
          >
            Manage
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          {manageNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            if (item.disabled) {
              return (
                <div key={item.label} className={navItemClass(false, true)}>
                  <Icon size={15} className="shrink-0 opacity-60" />
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={navItemClass(active)}
                onClick={() => onMobileClose?.()}
              >
                <Icon size={15} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Upgrade card */}
      {!collapsed && (
        <div className="mx-2 mb-3 mt-auto">
          <div
            className="rounded-xl p-3 border border-[hsl(var(--sidebar-border))]"
            style={{
              background:
                "linear-gradient(135deg, hsl(230 50% 18%), hsl(260 45% 16%))",
            }}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} style={{ color: "hsl(var(--brand))" }} />
              <span className="text-sm font-semibold text-white">
                Upgrade to Pro
              </span>
            </div>
            <p
              className="text-[11px] mt-1"
              style={{ color: "hsl(var(--sidebar-foreground) / 0.65)" }}
            >
              Unlock unlimited AI reports & insights.
            </p>
            <button className="w-full mt-2 h-8 rounded-lg bg-gradient-brand text-white text-xs font-medium hover:opacity-90">
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
