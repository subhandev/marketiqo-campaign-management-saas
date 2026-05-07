"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type DataResetCardProps = {
  resetMode: "demo" | "real";
  clientCount: number;
  campaignCount: number;
};

export function DataResetCard({
  resetMode,
  clientCount,
  campaignCount,
}: DataResetCardProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isDemoReset = resetMode === "demo";
  const resetSummary = `${clientCount} client${clientCount === 1 ? "" : "s"} and ${campaignCount} campaign${campaignCount === 1 ? "" : "s"}`;
  const confirmDescription = isDemoReset
    ? `This removes the demo workspace, including ${resetSummary}, and switches your account to the real workspace. You can add your own clients and campaigns after that.`
    : `This permanently deletes ${resetSummary}, plus related metrics and insights. Your account and workspace will remain.`;

  async function handleReset() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/settings/data/reset", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to reset data");
      }

      setConfirmOpen(false);
      setSuccess(
        data.resetMode === "demo"
          ? "Demo data reset. Your real workspace is now active."
          : "Workspace data reset."
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
                Data reset
              </h2>
              <p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                {isDemoReset
                  ? "You are currently viewing demo data. Reset it when you are ready to start with your real workspace."
                  : "Reset your workspace data when you want to start over."}
              </p>
              <p className="mt-2 text-sm font-medium text-[hsl(var(--foreground))]">
                {isDemoReset
                  ? "This removes demo data only."
                  : "This deletes clients, campaigns, metrics, and insights."}
              </p>
            </div>
          </div>

          <Button
            variant={isDemoReset ? "outline" : "destructive"}
            onClick={() => setConfirmOpen(true)}
            className="w-fit"
          >
            {isDemoReset ? "Reset demo data" : "Reset workspace data"}
          </Button>
        </div>

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success-soft))] p-3 text-sm text-[hsl(var(--success))]">
            <CheckCircle2 size={15} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive-soft))] p-3 text-sm text-[hsl(var(--destructive))]">
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={isDemoReset ? "Reset demo data?" : "Reset workspace data?"}
        description={confirmDescription}
        confirmLabel={isDemoReset ? "Reset demo data" : "Reset workspace data"}
        loadingLabel="Resetting..."
        loading={loading}
        onConfirm={handleReset}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
