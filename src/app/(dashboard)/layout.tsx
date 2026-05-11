// src/app/(dashboard)/layout.tsx

import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/server/db/client'
import {AppLayout} from '@/features/app-shell/AppLayout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) return null

  // Get Clerk user (Google/Apple/email all unified here)
  const user = await currentUser()

  if (!user) return null

  const email = user.emailAddresses[0]?.emailAddress
  if (!email) return null

  // Upsert avoids P2002 when parallel requests both pass the initial findUnique check.
  const dbUser = await prisma.user.upsert({
    where: { clerkUserId: user.id },
    create: {
      clerkUserId: user.id,
      email,
    },
    update: { email },
  })

  const workspaceCount = await prisma.workspace.count({
    where: { userId: dbUser.id },
  })

  if (workspaceCount === 0) {
    await prisma.workspace.create({
      data: {
        name: `${user.firstName || 'My'} Workspace`,
        userId: dbUser.id,
      },
    })
  }

  return <AppLayout>{children}</AppLayout>
}