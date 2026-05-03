"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createMetricSchema, CreateMetricInput } from "../schemas";
import { useMetricMutations } from "../hooks/useMetricMutations";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  onSuccess?: () => void;
}

export function AddMetricModal({ open, onClose, campaignId, onSuccess }: Props) {
  const router = useRouter();
  const { create } = useMetricMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateMetricInput>({
    resolver: zodResolver(createMetricSchema),
  });

  const onSubmit = async (data: CreateMetricInput) => {
    setSubmitError(null);
    try {
      await create(campaignId, data);
      reset();
      onClose();
      router.refresh();
      onSuccess?.();
    } catch {
      setSubmitError("Failed to save metrics. Please try again.");
    }
  };

  const inputCls =
    "w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring transition-colors";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold tracking-tight">Add Metrics</h2>
            <p className="text-sm text-muted-foreground">
              Record performance data for a specific date.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
              Date
            </label>
            <input type="date" className={inputCls} {...register("date")} />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* 2-col grid: Impressions + Clicks */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
                Impressions
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                className={inputCls}
                {...register("impressions", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
                Clicks
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                className={inputCls}
                {...register("clicks", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* 2-col grid: Spend + Conversions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
                Spend
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`${inputCls} pl-6`}
                  {...register("spend", { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
                Conversions
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                className={inputCls}
                {...register("conversions", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Info note */}
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            If a metric already exists for this date it will be updated.
          </p>

          {/* Submit error */}
          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save Metrics"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
