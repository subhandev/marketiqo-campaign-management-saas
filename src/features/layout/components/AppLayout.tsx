'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import {SidebarToggle } from './SidebarToggle'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen relative">

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Toggle (IMPORTANT: here, not in header/sidebar) */}
      <SidebarToggle
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
    </div>
  )
}