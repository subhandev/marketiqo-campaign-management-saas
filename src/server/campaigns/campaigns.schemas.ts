import { z } from "zod";

export const campaignStatusSchema = z.enum([
  "planned",
  "active",
  "at_risk",
  "completed",
  "archived",
]);

export const createCampaignSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  platform: z.string().min(1, "Platform is required"),
  status: campaignStatusSchema.default("planned"),
  goal: z.string().optional(),
  budget: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  deadline: z.string().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const createMetricSchema = z.object({
  impressions: z.number().int().min(0).default(0),
  clicks: z.number().int().min(0).default(0),
  spend: z.number().min(0).default(0),
  conversions: z.number().int().min(0).optional(),
  date: z.string().min(1, "Date is required"),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CreateMetricInput = z.infer<typeof createMetricSchema>;
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;
