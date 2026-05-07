"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { DemoSeedOverlay } from "./DemoSeedOverlay";

type DemoState = "idle" | "seeding" | "completing" | "ready";

export function DemoOnboarding({
  initialState,
}: {
  initialState: "needs_seed" | "seeded" | "none";
}) {
  const [state, setState] = useState<DemoState>(
    initialState === "needs_seed" ? "seeding" :
    initialState === "seeded"     ? "ready"   : "idle"
  );
  const overlayCompleteRef = useRef<(() => void) | null>(null);

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
          setState("completing");
          overlayCompleteRef.current?.();
        }
      } catch {}
    }, 2500);

    return () => {
      stopped = true;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [state]);

  if (state === "idle") return null;

  if (state === "seeding" || state === "completing") {
    return (
      <DemoSeedOverlay
        onComplete={() => window.location.reload()}
        onReadyToComplete={(fn) => { overlayCompleteRef.current = fn; }}
      />
    );
  }

  // state === "ready"
  return (
    <div className="mb-3 flex w-full flex-col gap-2 rounded-lg border border-[hsl(var(--info)/0.22)] bg-[hsl(var(--info-soft))] p-2 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-2.5">
        <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md bg-[hsl(var(--card)/0.78)] px-2 text-xs font-medium text-[hsl(var(--info))] ring-1 ring-[hsl(var(--info)/0.16)]">
          <Info size={12} />
          Demo mode
        </span>
        <p className="min-w-0 text-[hsl(var(--foreground))]">
          You&apos;re viewing sample data. Reset it from Settings when ready.
        </p>
      </div>
      <Link
        href="/settings"
        className="inline-flex h-7 w-fit shrink-0 cursor-pointer items-center justify-center rounded-md bg-[hsl(var(--card)/0.78)] px-2.5 text-xs font-medium text-[hsl(var(--info))] ring-1 ring-[hsl(var(--info)/0.16)] transition-colors hover:bg-[hsl(var(--card))]"
      >
        Manage
      </Link>
    </div>
  );
}
