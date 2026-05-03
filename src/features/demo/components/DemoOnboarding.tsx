"use client";

import { useEffect, useState } from "react";

type DemoState = "idle" | "seeding" | "ready" | "cleared";

export function DemoOnboarding({
  initialState,
}: {
  initialState: "needs_seed" | "seeded" | "none";
}) {
  const [state, setState] = useState<DemoState>(
    initialState === "needs_seed" ? "seeding" :
    initialState === "seeded"     ? "ready"   : "idle"
  );
  const [clearing, setClearing] = useState(false);
  const [dots, setDots] = useState(".");

  // Animate the loading dots
  useEffect(() => {
    if (state !== "seeding") return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [state]);

  // Fire seed + poll for completion
  useEffect(() => {
    if (state !== "seeding") return;

    let stopped = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    fetch("/api/demo/seed", { method: "POST" }).catch(() => {});

    pollInterval = setInterval(async () => {
      if (stopped) return;
      try {
        const res = await fetch("/api/demo/status");
        const data = await res.json();
        if (data.cleared) {
          clearInterval(pollInterval!);
          stopped = true;
          setState("idle");
          return;
        }
        if (data.seeded) {
          clearInterval(pollInterval!);
          stopped = true;
          setState("ready");
          window.location.reload();
        }
      } catch {}
    }, 2500);

    return () => {
      stopped = true;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  async function handleClear() {
    setClearing(true);
    await fetch("/api/demo/clear", { method: "DELETE" });
    window.location.href = "/clients/new";
  }

  if (state === "idle" || state === "cleared") return null;

  if (state === "seeding") {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm text-blue-700">
        <svg
          className="h-4 w-4 animate-spin shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Setting up your demo workspace — generating AI insights{dots}</span>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm">
      <div className="flex items-center gap-2 text-blue-700">
        <span>✦</span>
        <span>You&apos;re exploring Marketiqo with demo data.</span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="/clients/new"
          className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900 transition-colors"
        >
          Create first client →
        </a>
        <button
          onClick={handleClear}
          disabled={clearing}
          className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          {clearing ? "Clearing…" : "Clear demo data"}
        </button>
      </div>
    </div>
  );
}
