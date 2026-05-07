// src/features/app-shell/AppLayout.tsx

"use client";

import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-[margin-left] duration-200 ease-in-out",
          "ml-0",
          collapsed ? "md:ml-14" : "md:ml-64"
        )}
      >
        <Header onMobileMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-[hsl(var(--background))]">
          <div className="max-w-[1400px] mx-auto px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
