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
  Settings,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  soon?: boolean;
};

const workspaceNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Clients", icon: Users, href: "/clients" },
  { label: "Campaigns", icon: Megaphone, href: "/campaigns" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks", soon: true },
  { label: "Calendar", icon: Calendar, href: "/calendar", soon: true },
  { label: "Reports", icon: BarChart2, href: "/reports", soon: true },
  { label: "AI Reports", icon: Sparkles, href: "/ai-reports", badge: "AI", soon: true },
];

const manageNav: NavItem[] = [
  { label: "Team", icon: UsersRound, href: "/team", soon: true },
  { label: "Documents", icon: FileText, href: "/documents", soon: true },
  { label: "Integrations", icon: Plug, href: "/integrations", soon: true },
  { label: "Settings", icon: Settings, href: "/settings", soon: true },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[160px] h-full bg-[#0f1117] flex flex-col py-4">
      {/* Logo */}
      <div className="px-3 mb-2">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Marketiqo</p>
            <p className="text-zinc-500 text-[10px] leading-tight">AI Marketing Suite</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-1.5">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium px-3 mt-5 mb-1">
          Workspace
        </p>
        {workspaceNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.soon) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm text-zinc-600 cursor-default"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded-full ml-auto shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                active
                  ? "bg-white/10 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium px-3 mt-5 mb-1">
          Manage
        </p>
        {manageNav.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm text-zinc-600 cursor-default"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Upgrade card */}
      <div className="px-2 mt-3">
        <div className="bg-gradient-to-br from-purple-900/60 to-blue-900/40 rounded-xl p-3">
          <Sparkles className="h-4 w-4 text-purple-400 mb-1" />
          <p className="text-sm font-semibold text-white">Upgrade to Pro</p>
          <p className="text-xs text-zinc-400 mt-0.5 leading-tight">
            Unlock unlimited AI reports & insights.
          </p>
          <button className="w-full bg-white text-black text-xs font-medium py-1.5 rounded-lg mt-2.5 hover:bg-zinc-100 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}
