// src/features/clients/components/CreateClientForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Sparkles,
  StickyNote,
  UserRound,
} from "lucide-react";
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
import { useClientMutations } from "@/features/clients/hooks/useClients";
import {
  createClientSchema,
  CreateClientSchema,
} from "@/features/clients/schemas";
import { getInitials } from "@/shared/format/strings";
import { cn } from "@/lib/utils";

const INDUSTRIES = [
  "SaaS",
  "E-commerce",
  "Retail",
  "Health & Wellness",
  "Education",
  "Finance",
  "Real Estate",
  "Food & Beverage",
  "Travel",
  "Other",
];

type ClientFormProps = {
  defaultValues: CreateClientSchema;
  submitLabel: string;
  submittingLabel: string;
  detailsTitle: string;
  detailsDescription: string;
  previewDescription: string;
  onSubmit: (data: CreateClientSchema) => Promise<void>;
  onCancel: () => void;
  error?: string | null;
  loading?: boolean;
};

export function ClientForm({
  defaultValues,
  submitLabel,
  submittingLabel,
  detailsTitle,
  detailsDescription,
  previewDescription,
  onSubmit,
  onCancel,
  error,
  loading = false,
}: ClientFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateClientSchema>({
    resolver: zodResolver(createClientSchema),
    defaultValues,
  });

  const watched = useWatch({ control });

  const isSubmitting = loading || submitting;

  const handleFormSubmit = async (data: CreateClientSchema) => {
    try {
      setSubmitting(true);
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  const initials = watched.name ? getInitials(watched.name) : "?";
  const hasPreviewContent = Boolean(
    watched.name ||
      watched.company ||
      watched.industry ||
      watched.email ||
      watched.phone ||
      watched.website ||
      watched.notes
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
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
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserRound className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Identity</p>
                  <p className="text-xs text-muted-foreground">
                    Name and business context
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">
                    Client Name{" "}
                    <span className="text-destructive normal-case tracking-normal">
                      *
                    </span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. John Smith or StartupX"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company / Brand</Label>
                  <Input
                    id="company"
                    placeholder="e.g. Acme Corp"
                    aria-invalid={!!errors.company}
                    {...register("company")}
                  />
                  {errors.company && (
                    <p className="text-xs text-destructive">
                      {errors.company.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select
                    value={watched.industry}
                    onValueChange={(val) =>
                      setValue("industry", val, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <div className="h-px bg-border" />

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--info-soft))] text-[hsl(var(--info))]">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Contact</p>
                  <p className="text-xs text-muted-foreground">
                    Ways to reach this client
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. hello@company.com"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. +1 234 567 8900"
                    aria-invalid={!!errors.phone}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="e.g. https://company.com"
                    aria-invalid={!!errors.website}
                    {...register("website")}
                  />
                  {errors.website && (
                    <p className="text-xs text-destructive">
                      {errors.website.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <div className="h-px bg-border" />

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand))]">
                  <StickyNote className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Notes</p>
                  <p className="text-xs text-muted-foreground">
                    Optional context for future campaigns
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any context about this client, goals, or campaign notes..."
                  rows={4}
                  className="resize-none"
                  aria-invalid={!!errors.notes}
                  {...register("notes")}
                />
                <div className="flex items-center justify-between">
                  {errors.notes ? (
                    <p className="text-xs text-destructive">
                      {errors.notes.message}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {watched.notes?.length ?? 0}/500
                  </p>
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
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-fit"
              disabled={isSubmitting || !watched.name?.trim()}
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
                      <Building2 className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-sm font-medium">
                      Fill in the form to preview the client
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Name, industry, contact details, and notes will appear
                      here as you type.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 p-5">
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted/25 p-5 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                      {initials}
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold">
                        {watched.name || "Client Name"}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {watched.industry && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            {watched.industry}
                          </span>
                        )}
                        <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <PreviewRow
                      icon={Building2}
                      label="Company"
                      value={watched.company}
                    />
                    <PreviewRow icon={Mail} label="Email" value={watched.email} />
                    <PreviewRow icon={Phone} label="Phone" value={watched.phone} />
                    <PreviewRow
                      icon={Globe}
                      label="Website"
                      value={watched.website}
                    />
                    {watched.notes && (
                      <div className="rounded-xl border border-border bg-muted/25 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Notes
                        </p>
                        <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-foreground">
                          {watched.notes}
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
    </form>
  );
}

export function CreateClientForm() {
  const router = useRouter();
  const { create, loading, error } = useClientMutations();

  const handleSubmit = async (data: CreateClientSchema) => {
    await create(data);
    router.refresh();
    router.push("/clients");
  };

  return (
    <ClientForm
      defaultValues={{
        name: "",
        company: "",
        industry: "",
        email: "",
        phone: "",
        website: "",
        notes: "",
      }}
      submitLabel="Create Client"
      submittingLabel="Creating..."
      detailsTitle="Client details"
      detailsDescription="Start with the essentials. You can edit everything later."
      previewDescription="This is how the client profile will appear in your workspace."
      onSubmit={handleSubmit}
      onCancel={() => router.push("/clients")}
      error={error}
      loading={loading}
    />
  );
}

function PreviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
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
