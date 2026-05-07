"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { Client } from "@/features/clients/types";

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

interface EditClientFormProps {
  client: Client;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditClientForm({
  client,
  onSuccess,
  onCancel,
}: EditClientFormProps) {
  const { update, loading, error } = useClientMutations();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateClientSchema>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: client.name,
      company: client.company ?? "",
      industry: client.industry ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      website: client.website ?? "",
      notes: client.notes ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: client.name,
      company: client.company ?? "",
      industry: client.industry ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      website: client.website ?? "",
      notes: client.notes ?? "",
    });
  }, [client, reset]);

  const watched = useWatch({ control });

  const onSubmit = async (data: CreateClientSchema) => {
    try {
      await update(client.id, data);
      onSuccess();
    } catch {
      // error handled in hook
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="edit-name">
            Client Name{" "}
            <span className="text-destructive normal-case tracking-normal">
              *
            </span>
          </Label>
          <Input
            id="edit-name"
            placeholder="e.g. John Smith or StartupX"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Company */}
        <div className="space-y-2">
          <Label htmlFor="edit-company">Company / Brand</Label>
          <Input
            id="edit-company"
            placeholder="e.g. Acme Corp"
            {...register("company")}
          />
        </div>

        {/* Industry + Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Industry</Label>
            <Select
              value={watched.industry}
              onValueChange={(val) =>
                setValue("industry", val, { shouldValidate: true })
              }
            >
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="e.g. hello@company.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Phone + Website */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              type="tel"
              placeholder="e.g. +1 234 567 8900"
              {...register("phone")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-website">Website</Label>
            <Input
              id="edit-website"
              type="url"
              placeholder="e.g. https://company.com"
              {...register("website")}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="edit-notes">Notes</Label>
          <Textarea
            id="edit-notes"
            placeholder="Any context about this client..."
            rows={3}
            className="resize-none"
            {...register("notes")}
          />
          <div className="flex justify-end">
            <p className="text-xs text-muted-foreground">
              {watched.notes?.length ?? 0}/500
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading || !watched.name?.trim()}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
