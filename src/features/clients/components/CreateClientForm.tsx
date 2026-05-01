// src/features/clients/components/CreateClientForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useClientMutations } from "@/features/clients/hooks/useClients";
import { CreateClientInput } from "@/features/clients/types";

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

  const [form, setForm] = useState<CreateClientInput>({
    name: "",
    company: "",
    industry: "",
    email: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      await create(form);
      router.push("/clients");
    } catch {
      // error is already set in the hook
    }
  };

  const initials = form.name
    ? form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2 space-y-5">
        {/* Client Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Client Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter client name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        {/* Company */}
        <div className="space-y-1.5">
          <Label htmlFor="company">Company / Brand (optional)</Label>
          <Input
            id="company"
            name="company"
            placeholder="Enter company or brand name"
            value={form.company}
            onChange={handleChange}
          />
        </div>

        {/* Industry */}
        <div className="space-y-1.5">
          <Label>Industry (optional)</Label>
          <Select
            value={form.industry}
            onValueChange={(val) =>
              setForm((prev) => ({ ...prev, industry: val }))
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

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Add any notes about the client..."
            value={form.notes}
            onChange={handleChange}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {form.notes?.length ?? 0}/500
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => router.push("/clients")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !form.name.trim()}
          >
            {loading ? "Creating..." : "Create Client"}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="hidden lg:block">
        <p className="text-sm font-medium mb-4">Client Preview</p>
        <div className="rounded-xl border bg-muted/30 p-6 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-semibold">
              {initials}
            </div>
            <span className="font-medium text-sm">
              {form.name || "Client Name"}
            </span>
            {form.industry && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {form.industry}
              </span>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Company / Brand</span>
              <span>{form.company || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="truncate max-w-[140px]">
                {form.email || "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Notes</span>
              <span className="text-xs">
                {form.notes || "No notes added"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}