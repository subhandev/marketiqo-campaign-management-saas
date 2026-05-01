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

  // 🔥 Sync user with DB
  let dbUser = await prisma.user.findUnique({
    where: { clerkUserId: user.id },
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkUserId: user.id,
        email: user.emailAddresses[0].emailAddress,
      },
    })

    // Create default workspace
    await prisma.workspace.create({
      data: {
        name: `${user.firstName || 'My'} Workspace`,
        userId: dbUser.id,
      },
    })
  }

  return <AppLayout>{children}</AppLayout>
}