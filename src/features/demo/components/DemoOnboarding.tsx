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
  /** Strict Mode mounts twice; skip only the duplicate initial POST, not the polling interval teardown/setup. */
  const initialSeedKickoffSentRef = useRef(false);

  // Fire seed + poll for completion (run once per needs_seed session; do not tie to `state`
  // or the effect can restart and overlapping intervals amplify /api/demo/status calls).
  useEffect(() => {
    if (initialState !== "needs_seed") return;

    let stopped = false;
    let pollAttempts = 0;
    const MAX_POLL_ATTEMPTS = 100; // ~4–5 min then give up (seed is synchronous; this catches stuck DB/API)

    const lastSeedAtRef = { current: 0 };
    const fullSeedPostsRef = { current: 0 };
    const seedInFlightRef = { current: false };
    const MAX_CLIENT_SEED_POSTS = 6;
    /** Longer than typical failed seed + server lease so we do not stack redundant POSTs. */
    const RESEED_COOLDOWN_MS = 60_000;

    const triggerSeed = () => {
      if (stopped || seedInFlightRef.current) return;
      if (fullSeedPostsRef.current >= MAX_CLIENT_SEED_POSTS) return;
      seedInFlightRef.current = true;
      lastSeedAtRef.current = Date.now();
      fetch("/api/demo/seed", { method: "POST" })
        .then(async (res) => {
          if (res.status === 202) return;
          fullSeedPostsRef.current += 1;
          try {
            await res.json();
          } catch {
            // ignore empty / non-JSON body
          }
        })
        .finally(() => {
          seedInFlightRef.current = false;
        });
    };

    if (!initialSeedKickoffSentRef.current) {
      initialSeedKickoffSentRef.current = true;
      triggerSeed();
    }

    const pollInterval = setInterval(async () => {
      if (stopped) return;
      pollAttempts += 1;
      if (pollAttempts > MAX_POLL_ATTEMPTS) {
        clearInterval(pollInterval);
        stopped = true;
        setState("idle");
        return;
      }
      try {
        const res = await fetch("/api/demo/status");
        const data = await res.json();
        if (data.cleared) {
          clearInterval(pollInterval);
          stopped = true;
          setState("idle");
          return;
        }
        if (data.seeded) {
          clearInterval(pollInterval);
          stopped = true;
          setState("completing");
          overlayCompleteRef.current?.();
          return;
        }
        if (
          !data.cleared &&
          !data.seeded &&
          fullSeedPostsRef.current < MAX_CLIENT_SEED_POSTS &&
          Date.now() - lastSeedAtRef.current >= RESEED_COOLDOWN_MS
        ) {
          triggerSeed();
        }
      } catch {
        // ignore transient errors
      }
    }, 3000);

    return () => {
      stopped = true;
      clearInterval(pollInterval);
    };
  }, [initialState]);

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
