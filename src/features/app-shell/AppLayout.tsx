// src/features/app-shell/AppLayout.tsx

"use client";

import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f8fa]">
      {/* Sidebar — fixed */}
      <div className="fixed left-0 top-0 w-[160px] h-full z-20">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="ml-[160px] flex-1 flex flex-col min-h-screen">
        <div className="sticky top-0 z-10">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto bg-[#f7f8fa] p-6">
          <div className="max-w-7xl mx-auto space-y-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
