// src/features/clients/components/CreateClientForm.tsx

"use client";

import { useRouter } from "next/navigation";
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
import { useClientMutations } from "@/features/clients/hooks/useClients";
import {
  createClientSchema,
  CreateClientSchema,
} from "@/features/clients/schemas";

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

export function CreateClientForm() {
  const router = useRouter();
  const { create, loading, error } = useClientMutations();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateClientSchema>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: "",
      company: "",
      industry: "",
      email: "",
      phone: "",
      website: "",
      notes: "",
    },
  });

  const watched = watch();

  const onSubmit = async (data: CreateClientSchema) => {
    try {
      await create(data);
      router.push("/clients");
    } catch {
      // error handled in hook
    }
  };

  const initials = watched.name
    ? watched.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Client Name{" "}
              <span className="text-destructive normal-case tracking-normal">
                *
              </span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. John Smith or StartupX"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">Company / Brand</Label>
            <Input
              id="company"
              placeholder="e.g. Acme Corp"
              {...register("company")}
            />
            {errors.company && (
              <p className="text-xs text-destructive">
                {errors.company.message}
              </p>
            )}
          </div>

          {/* Industry + Email side by side */}
          <div className="grid grid-cols-2 gap-4">
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

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. hello@company.com"
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
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="e.g. https://company.com"
                {...register("website")}
              />
              {errors.website && (
                <p className="text-xs text-destructive">
                  {errors.website.message}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any context about this client, goals, or campaign notes..."
              rows={4}
              className="resize-none"
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

          {/* API Error */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => router.push("/clients")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={loading || !watched.name?.trim()}
            >
              {loading ? "Creating..." : "Create Client"}
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="hidden lg:flex flex-col gap-3 pt-8">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Preview
          </p>

          <div className="rounded-xl border bg-zinc-50 border-zinc-200 shadow-sm  overflow-hidden">
            <div className="p-6 space-y-5">
              {/* Avatar + Name */}
              <div className="flex flex-col items-center gap-3 pb-5 border-b border-primary/10">
                <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                  {initials}
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-base font-bold">
                    {watched.name || "Client Name"}
                  </p>
                  {watched.industry ? (
                    <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full inline-block font-medium">
                      {watched.industry}
                    </span>
                  ) : (
                    <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full inline-block font-medium">
                      No industry
                    </span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Company
                  </p>
                  <p className="text-sm font-semibold">
                    {watched.company || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {watched.email || "—"}
                  </p>
                </div>
                {watched.notes && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Notes
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {watched.notes}
                    </p>
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
