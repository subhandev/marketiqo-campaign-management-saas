// src/server/db/client.ts

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/** After Neon/adapter drops (“not queryable”), the singleton must disconnect before reuse. */
export async function disconnectPrismaClientSafe(): Promise<void> {
  try {
    await prisma.$disconnect()
  } catch {
    /* already closed */
  }
}
