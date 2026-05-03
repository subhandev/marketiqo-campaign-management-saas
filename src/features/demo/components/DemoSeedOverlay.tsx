"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "Creating clients and campaign structures" },
  { label: "Loading metrics and performance data" },
  { label: "Generating AI insights with Groq" },
];

interface DemoSeedOverlayProps {
  onComplete: () => void;
  onReadyToComplete: (trigger: () => void) => void;
}

export function DemoSeedOverlay({ onComplete, onReadyToComplete }: DemoSeedOverlayProps) {
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0);
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [progress, setProgress] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  // Expose triggerComplete to parent on mount
  useEffect(() => {
    onReadyToComplete(triggerComplete);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fake step 0 → 1 → 2 progression
  useEffect(() => {
    const t1 = setTimeout(() => { setCurrentStep(1); setProgress(28); }, 1800);
    const t2 = setTimeout(() => { setCurrentStep(2); setProgress(52); }, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Slow progress crawl during step 2: 52 → 88, never past 88 until confirmed
  useEffect(() => {
    if (currentStep !== 2) return;
    const interval = setInterval(() => {
      setProgress((p) => (p >= 88 ? p : p + 3));
    }, 1800);
    return () => clearInterval(interval);
  }, [currentStep]);

  // Countdown timer — pauses at 2
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s <= 2 ? s : s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function triggerComplete() {
    setCompleting(true);
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => setMounted(false), 450);
      setTimeout(() => { onComplete(); }, 500);
    }, 600);
  }

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/75 backdrop-blur-sm transition-opacity duration-500 ${
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl px-8 py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">✦</span>
            <h2 className="text-lg font-semibold tracking-tight">
              Setting up your workspace
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Generating AI insights for your demo campaigns.
          </p>
        </div>

        {/* Progress bar + countdown */}
        <div className="flex flex-col gap-2">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {secondsLeft > 2 ? `~${secondsLeft} seconds remaining` : "Almost ready…"}
          </span>
        </div>

        {/* Steps list */}
        <div className="flex flex-col gap-3">
          {STEPS.map((step, index) => {
            const isDone    = index < currentStep || completing;
            const isActive  = index === currentStep && !completing;
            const isPending = index > currentStep && !completing;

            return (
              <div key={index} className="flex items-center gap-3">

                {/* Step icon */}
                <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                  {isDone && (
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0
                           00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {isActive && (
                    <svg
                      className="w-4 h-4 text-primary animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12" cy="12" r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {isPending && (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>

                {/* Step label */}
                <span
                  className={`text-sm transition-colors ${
                    isDone
                      ? "text-foreground"
                      : isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>

              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground border-t border-border pt-4">
          This is a one-time setup. Your workspace will be ready in moments.
        </p>

      </div>
    </div>
  );
}
