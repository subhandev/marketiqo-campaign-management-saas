"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMetricSchema, CreateMetricInput } from "../schemas";
import { useMetricMutations } from "../hooks/useMetricMutations";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  onSuccess?: () => void;
}

export function AddMetricModal({
  open,
  onClose,
  campaignId,
  onSuccess,
}: Props) {
  const { create } = useMetricMutations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateMetricInput>({
    resolver: zodResolver(createMetricSchema),
  });

  const onSubmit = async (data: CreateMetricInput) => {
    await create(campaignId, data);
    reset();
    onClose();
    onSuccess?.(); // 🔥 refetch metrics
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Metrics</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

          <Input type="date" {...register("date")} />
          {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}

          <Input placeholder="Impressions" type="number" {...register("impressions", { valueAsNumber: true })} />
          <Input placeholder="Clicks" type="number" {...register("clicks", { valueAsNumber: true })} />
          <Input placeholder="Spend ($)" type="number" {...register("spend", { valueAsNumber: true })} />
          <Input placeholder="Conversions" type="number" {...register("conversions", { valueAsNumber: true })} />
          <Input placeholder="Revenue ($)" type="number" {...register("revenue", { valueAsNumber: true })} />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Save Metrics
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}