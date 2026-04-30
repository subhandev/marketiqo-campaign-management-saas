import { prisma } from '@/server/db/client'

export async function createCampaignRepo(data: {
  name: string
  platform: string
  status?: string
}) {
  return prisma.campaign.create({
    data: {
      name: data.name,
      platform: data.platform,
      status: data.status || 'active',
    },
  })
}