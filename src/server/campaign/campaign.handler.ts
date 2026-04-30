import { createCampaignService } from './campaign.service'

export async function handleCreateCampaign(body: any) {
  try {
    const campaign = await createCampaignService(body)

    return {
      status: 201,
      body: campaign,
    }
  } catch (error: any) {
    return {
      status: 400,
      body: {
        error: error.message || 'Something went wrong',
      },
    }
  }
}