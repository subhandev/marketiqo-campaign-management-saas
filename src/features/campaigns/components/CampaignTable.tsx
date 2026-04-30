'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCampaigns } from '../hooks/useCampaigns'

function getStatusVariant(status: string) {
  switch (status) {
    case 'active':
      return 'default'
    case 'paused':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function CampaignTable() {
  const { data, loading, error } = useCampaigns()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campaigns</CardTitle>
      </CardHeader>

      <CardContent>
        {loading && <p>Loading campaigns...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    {campaign.name}
                  </TableCell>

                  <TableCell>{campaign.platform}</TableCell>

                  <TableCell>
                    <Badge variant={getStatusVariant(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}