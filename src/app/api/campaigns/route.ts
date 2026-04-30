import { handleCreateCampaign } from '@/server/campaign/campaign.handler'

export async function POST(req: Request) {
  const body = await req.json()

  const result = await handleCreateCampaign(body)

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}