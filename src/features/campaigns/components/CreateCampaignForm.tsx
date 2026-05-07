"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeDollarSign,
  CalendarDays,
  Clock3,
  Megaphone,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useClients } from "@/features/clients/hooks/useClients";
import { createCampaignSchema, CreateCampaignInput } from "@/features/campaigns/schemas";
import { useCampaignMutations } from "@/features/campaigns/hooks/useCampaigns";
import { Campaign, CampaignStatus } from "@/features/campaigns/types";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  "Google Ads",
  "Meta Ads",
  "LinkedIn Ads",
  "YouTube Ads",
  "TikTok Ads",
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

const statusStyles: Record<CampaignStatus, string> = {
  planned: "border-blue-200 bg-blue-50 text-blue-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  at_risk: "border-rose-200 bg-rose-50 text-rose-700",
  completed: "border-zinc-200 bg-zinc-50 text-zinc-500",
  archived: "border-zinc-200 bg-zinc-50 text-zinc-500",
};

const platformStyles: Record<string, string> = {
  "Google Ads": "border-amber-200 bg-amber-50 text-amber-700",
  "Meta Ads": "border-indigo-200 bg-indigo-50 text-indigo-700",
  "LinkedIn Ads": "border-blue-200 bg-blue-50 text-blue-700",
  "YouTube Ads": "border-red-200 bg-red-50 text-red-700",
  "TikTok Ads": "border-pink-200 bg-pink-50 text-pink-700",
  "Twitter/X": "border-zinc-200 bg-zinc-100 text-zinc-700",
  Email: "border-violet-200 bg-violet-50 text-violet-700",
  SEO: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Other: "border-slate-200 bg-slate-100 text-slate-600",
};

type CreateCampaignFormProps = {
  campaign?: Campaign;
  mode?: "create" | "edit";
};

function SectionHeader({
  icon: Icon,
  title,
  description,
  tone = "primary",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  tone?: "primary" | "info" | "brand";
}) {
  const toneClass =
    tone === "info"
      ? "bg-[hsl(var(--info-soft))] text-[hsl(var(--info))]"
      : tone === "brand"
      ? "bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]"
      : "bg-primary/10 text-primary";

  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", toneClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-muted/25 p-3",
        !value && "text-muted-foreground"
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium">{value || "Not added"}</p>
      </div>
    </div>
  );
}

export function CreateCampaignForm({
  campaign,
  mode = "create",
}: CreateCampaignFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId") ?? "";
  const isEditing = mode === "edit" && campaign;
  const [submitting, setSubmitting] = useState(false);

  const { clients } = useClients();
  const { create, update, loading, error } = useCampaignMutations();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      name: campaign?.name ?? "",
      clientId: campaign?.clientId ?? preselectedClientId,
      description: campaign?.description ?? "",
      platform: campaign?.platform ?? "",
      status: campaign?.status ?? "planned",
      goal: campaign?.goal ?? "",
      budget: campaign?.budget ?? undefined,
      startDate: campaign?.startDate?.slice(0, 10) ?? "",
      endDate: campaign?.endDate?.slice(0, 10) ?? "",
      deadline: campaign?.deadline?.slice(0, 10) ?? "",
    },
  });

  const watched = useWatch({ control });
  const selectedClient = clients.find((client) => client.id === watched.clientId);
  const isSubmitting = loading || submitting;
  const submitLabel = isEditing ? "Save Campaign" : "Create Campaign";
  const submittingLabel = isEditing ? "Saving..." : "Creating...";
  const detailsTitle = isEditing ? "Campaign details" : "Campaign details";
  const detailsDescription = isEditing
    ? "Update campaign setup. Metrics and AI insights stay unchanged."
    : "Set up the campaign basics. Metrics and insights can be added after creation.";
  const previewDescription = isEditing
    ? "This is how the updated campaign profile will appear in your workspace."
    : "This is how the campaign will appear in your workspace.";

  const hasPreviewContent = Boolean(
    watched.name ||
      watched.clientId ||
      watched.platform ||
      watched.description ||
      watched.goal ||
      watched.budget ||
      watched.startDate ||
      watched.endDate ||
      watched.deadline
  );

  const onSubmit = async (data: CreateCampaignInput) => {
    try {
      setSubmitting(true);
      if (isEditing) {
        await update(campaign.id, data);
        router.push(`/campaigns/${campaign.id}`);
      } else {
        await create(data);
        router.push("/campaigns");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="grid w-full grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="border-b border-border bg-muted/30 px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">
              {detailsTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {detailsDescription}
            </p>
          </div>

          <div className="space-y-6 p-5">
            <section className="space-y-4">
              <SectionHeader
                icon={Megaphone}
                title="Identity"
                description="Name, client, and channel"
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">
                    Campaign Name{" "}
                    <span className="text-destructive normal-case tracking-normal">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Q2 Performance - Search Brand"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Client{" "}
                    <span className="text-destructive normal-case tracking-normal">*</span>
                  </Label>
                  <Select
                    value={watched.clientId}
                    onValueChange={(val) =>
                      setValue("clientId", val, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="w-full">
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

                <div className="space-y-2">
                  <Label>
                    Platform{" "}
                    <span className="text-destructive normal-case tracking-normal">*</span>
                  </Label>
                  <Select
                    value={watched.platform}
                    onValueChange={(val) =>
                      setValue("platform", val, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.platform && (
                    <p className="text-xs text-destructive">{errors.platform.message}</p>
                  )}
                </div>
              </div>
            </section>

            <div className="h-px bg-border" />

            <section className="space-y-4">
              <SectionHeader
                icon={Target}
                title="Strategy"
                description="Goal, status, budget, and context"
                tone="info"
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Campaign Goal</Label>
                  <Select
                    value={watched.goal}
                    onValueChange={(val) =>
                      setValue("goal", val, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOALS.map((goal) => (
                        <SelectItem key={goal} value={goal}>
                          {goal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={watched.status}
                    onValueChange={(val) =>
                      setValue("status", val as CampaignStatus, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="w-full">
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="budget">Budget</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 22000"
                      className="pl-7"
                      aria-invalid={!!errors.budget}
                      {...register("budget", {
                        setValueAs: (value) =>
                          value === "" || value == null ? undefined : Number(value),
                      })}
                    />
                  </div>
                  {errors.budget && (
                    <p className="text-xs text-destructive">{errors.budget.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this campaign trying to achieve?"
                    rows={4}
                    className="resize-none"
                    aria-invalid={!!errors.description}
                    {...register("description")}
                  />
                  <div className="flex items-center justify-between">
                    {errors.description ? (
                      <p className="text-xs text-destructive">
                        {errors.description.message}
                      </p>
                    ) : (
                      <span />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {watched.description?.length ?? 0}/300
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-border" />

            <section className="space-y-4">
              <SectionHeader
                icon={CalendarDays}
                title="Timeline"
                description="Campaign dates and deadline"
                tone="brand"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" {...register("startDate")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" {...register("endDate")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input id="deadline" type="date" {...register("deadline")} />
                </div>
              </div>
            </section>

            {error && (
              <div className="rounded-lg border border-destructive/25 bg-destructive-soft p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full sm:w-fit"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-fit"
              disabled={
                isSubmitting ||
                !watched.name?.trim() ||
                !watched.clientId ||
                !watched.platform
              }
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </div>
        </div>

        <div className="hidden min-w-0 xl:block">
          <div className="sticky top-6">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <div className="border-b border-border bg-gradient-to-br from-primary/10 via-[hsl(var(--brand-soft))] to-background px-5 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Live preview</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {previewDescription}
                </p>
              </div>

              {!hasPreviewContent ? (
                <div className="flex min-h-[420px] items-center justify-center p-8">
                  <div className="max-w-xs text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <Megaphone className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-sm font-medium">
                      Fill in the form to preview the campaign
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Client, platform, goal, budget, and timeline details will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 p-5">
                  <div className="rounded-2xl border border-border bg-muted/25 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold">
                        {watched.name || "Campaign Name"}
                      </p>
                      {watched.platform && (
                        <span
                          className={cn(
                            "rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                            platformStyles[watched.platform] ??
                              "border-slate-200 bg-slate-100 text-slate-600"
                          )}
                        >
                          {watched.platform}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {selectedClient && (
                        <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                          {selectedClient.name}
                        </span>
                      )}
                      {watched.status && (
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-xs font-medium",
                            statusStyles[watched.status as CampaignStatus]
                          )}
                        >
                          {watched.status.replace("_", " ")}
                        </span>
                      )}
                    </div>

                    {watched.description && (
                      <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                        {watched.description}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <PreviewRow
                      icon={Target}
                      label="Goal"
                      value={watched.goal}
                    />
                    <PreviewRow
                      icon={BadgeDollarSign}
                      label="Budget"
                      value={watched.budget ? `$${watched.budget.toLocaleString()}` : undefined}
                    />
                    <PreviewRow
                      icon={Clock3}
                      label="Timeline"
                      value={
                        watched.startDate || watched.endDate
                          ? `${watched.startDate || "No start"} -> ${watched.endDate || "No end"}`
                          : undefined
                      }
                    />
                    <PreviewRow
                      icon={CalendarDays}
                      label="Deadline"
                      value={watched.deadline}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
