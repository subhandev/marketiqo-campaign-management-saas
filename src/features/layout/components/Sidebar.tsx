export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-muted/40 p-4">
      <h2 className="text-lg font-semibold mb-6">AI Tracker</h2>

      <nav className="space-y-2">
        <div className="rounded-md bg-accent px-3 py-2 text-sm font-medium">
          Campaigns
        </div>

        <div className="px-3 py-2 text-sm text-muted-foreground">
          Insights
        </div>

        <div className="px-3 py-2 text-sm text-muted-foreground">
          Settings
        </div>
      </nav>
    </aside>
  )
}