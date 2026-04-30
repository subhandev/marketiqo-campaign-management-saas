import { createCampaignRepo } from './campaign.repository'

export async function createCampaignService(data: any) {
  // Basic validation
  if (!data.name || !data.platform) {
    throw new Error('Missing required fields: name, platform')
  }

  // Future: add more logic here (mapping, AI, etc.)

  return createCampaignRepo(data)
}