import { AppLayout } from '@/features/layout/components/AppLayout'
import { CampaignTable } from '@/features/campaigns/components/CampaignTable'

export default function Home() {
  return (
    <AppLayout>
      <CampaignTable />
    </AppLayout>
  )
}