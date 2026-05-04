"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/features/clients/hooks/useClients";
import { useCampaignMutations } from "@/features/campaigns/hooks/useCampaigns";
import { createCampaignSchema, CreateCampaignInput } from "@/features/campaigns/schemas";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  "Meta",
  "Google",
  "YouTube",
  "TikTok",
  "LinkedIn",
  "Twitter/X",
  "Email",
  "SEO",
  "Other",
];

const GOALS = [
  "Increase Website Traffic",
  "Generate Leads",
  "Boost Brand Awareness",
  "Drive Sales",
  "Improve ROAS",
  "Grow Social Following",
  "Increase Engagement",
  "Other",
];

const statusStyles = {
  planned:   "bg-blue-50 text-blue-700 border-blue-200",
  active:    "bg-green-50 text-green-700 border-green-200",
  at_risk:   "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-zinc-100 text-zinc-500 border-zinc-200",
  archived:  "bg-zinc-100 text-zinc-400 border-zinc-200",
};

export function CreateCampaignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId") ?? "";

  const { clients } = useClients();
  const { create, loading, error } = useCampaignMutations();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      name: "",
      clientId: preselectedClientId,
      description: "",
      platform: "",
      status: "planned",
      goal: "",
      startDate: "",
      endDate: "",
      deadline: "",
    },
  });

  const watched = watch();

  const selectedClient = clients.find((c) => c.id === watched.clientId);

  const onSubmit = async (data: CreateCampaignInput) => {
    try {
      await create(data);
      router.push("/campaigns");
    } catch {
      // error handled in hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-start w-full">

        {/* Form */}
        <div className="space-y-6 min-w-0">

          {/* Name + Client */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Campaign Name <span className="text-destructive normal-case tracking-normal">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Summer Sale Launch"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Client <span className="text-destructive normal-case tracking-normal">*</span>
              </Label>
              <Select
                value={watched.clientId}
                onValueChange={(val) =>
                  setValue("clientId", val, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-xs text-destructive">{errors.clientId.message}</p>
              )}
            </div>
          </div>

          {/* Platform + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Platform <span className="text-destructive normal-case tracking-normal">*</span>
              </Label>
              <Select
                value={watched.platform}
                onValueChange={(val) =>
                  setValue("platform", val, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.platform && (
                <p className="text-xs text-destructive">{errors.platform.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watched.status}
                onValueChange={(val) =>
                  setValue("status", val as any, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this campaign trying to achieve?"
              rows={3}
              className="resize-none"
              {...register("description")}
            />
            <div className="flex items-center justify-between">
              {errors.description ? (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              ) : <span />}
              <p className="text-xs text-muted-foreground">
                {watched.description?.length ?? 0}/300
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label>Timeline</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Start Date</p>
                <Input type="date" {...register("startDate")} />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">End Date</p>
                <Input type="date" {...register("endDate")} />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Deadline</p>
                <Input type="date" {...register("deadline")} />
              </div>
            </div>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label>Campaign Goal</Label>
            <Select
              value={watched.goal}
              onValueChange={(val) =>
                setValue("goal", val, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a goal (optional)" />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Error */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={loading || !watched.name?.trim() || !watched.clientId || !watched.platform}
            >
              {loading ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="hidden lg:block min-w-0">
          <div className="sticky top-6 w-full flex justify-center">
            <div className="w-full max-w-[460px]">
              <div className="rounded-xl border bg-zinc-50 border-zinc-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                {!(
                  watched.name ||
                  watched.clientId ||
                  watched.platform ||
                  watched.description ||
                  watched.goal ||
                  watched.startDate ||
                  watched.endDate ||
                  watched.deadline
                ) ? (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <p className="text-xs text-muted-foreground text-center">
                      Fill in the form to see a preview
                    </p>
                  </div>
                ) : (
                  <div className="p-6 space-y-5 flex-1 flex flex-col">
                    {/* Name + Client + Status */}
                    <div className="flex flex-col gap-1 pb-5 border-b border-primary/10">
                      <h3 className="text-base font-bold">
                        {watched.name || "Campaign Name"}
                      </h3>
                      {selectedClient && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-4 w-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                            {selectedClient.name[0]}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {selectedClient.name}
                          </span>
                        </div>
                      )}
                      {watched.status && (
                        <span
                          className={cn(
                            "text-xs px-2.5 py-0.5 rounded-full font-medium border w-fit mt-1",
                            statusStyles[watched.status as keyof typeof statusStyles]
                          )}
                        >
                          {watched.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                      {watched.platform && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Platform
                          </p>
                          <p className="text-sm font-semibold">{watched.platform}</p>
                        </div>
                      )}

                      {(watched.startDate || watched.endDate) && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Timeline
                          </p>
                          <p className="text-sm font-semibold">
                            {watched.startDate || "—"} → {watched.endDate || "—"}
                          </p>
                        </div>
                      )}

                      {watched.deadline && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Deadline
                          </p>
                          <p className="text-sm font-semibold">{watched.deadline}</p>
                        </div>
                      )}

                      {watched.goal && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Goal
                          </p>
                          <p className="text-sm font-semibold">{watched.goal}</p>
                        </div>
                      )}

                      {watched.description && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Description
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                            {watched.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </form>
  );
}
