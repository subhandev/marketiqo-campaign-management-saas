'use client'

import { useCampaigns } from '../hooks/useCampaigns'

export function CampaignList() {
  const { campaigns, loading, error } = useCampaigns()

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h2>Campaigns</h2>
      <ul>
        {campaigns.map((c) => (
          <li key={c.id}>
            {c.name} ({c.platform})
          </li>
        ))}
      </ul>
    </div>
  )
}