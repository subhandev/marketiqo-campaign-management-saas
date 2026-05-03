import { createMetric } from "../api/campaigns.api";
import { CreateMetricInput } from "../schemas";

export function useMetricMutations() {
  const create = async (campaignId: string, data: CreateMetricInput) => {
    return await createMetric(campaignId, data);
  };

  return { create };
}