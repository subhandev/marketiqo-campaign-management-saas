// src/features/campaigns/schemas.ts

import { z } from "zod";

export const createCampaignSchema = z.object({
  name: z
    .string()
    .min(1, "Campaign name is required")
    .max(100, "Campaign name must be under 100 characters"),
  clientId: z.string().min(1, "Client is required"),
  description: z
    .string()
    .max(300, "Description must be under 300 characters")
    .optional(),
  platform: z.string().min(1, "Platform is required"),
  goal: z.string().optional(),
  status: z
    .enum(["planned", "active", "at_risk", "completed", "archived"])
    .default("planned"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  deadline: z.string().optional(),
});

export type CreateCampaignInput = z.input<typeof createCampaignSchema>;

export const createMetricSchema = z.object({
  date: z.string().min(1, "Date is required"),
  impressions: z.number().min(0).optional(),
  clicks: z.number().min(0).optional(),
  spend: z.number().min(0).optional(),
  conversions: z.number().min(0).optional(),
  revenue: z.number().min(0).optional(),
});

export type CreateMetricInput = z.infer<typeof createMetricSchema>;
