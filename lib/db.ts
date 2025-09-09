import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Database utilities
export async function getDomainFromDB(hostname: string) {
  try {
    const domain = await prisma.domain.findUnique({
      where: { hostname },
    })
    return domain
  } catch (error) {
    console.error("Failed to fetch domain from database:", error)
    return null
  }
}

export async function trackToolUsage(data: {
  toolSlug: string
  domainId: string
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  fileSize?: number
  fileCount?: number
  processingTime?: number
  success?: boolean
  errorMessage?: string
}) {
  try {
    await prisma.toolUsage.create({
      data,
    })
  } catch (error) {
    console.error("Failed to track tool usage:", error)
  }
}

export async function trackAdImpression(data: {
  adSlot: string
  domainId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  dwellTime?: number
}) {
  try {
    await prisma.adImpression.create({
      data,
    })
  } catch (error) {
    console.error("Failed to track ad impression:", error)
  }
}

export async function cleanupExpiredFiles() {
  try {
    const expired = await prisma.processedFile.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
    console.log(`Cleaned up ${expired.count} expired files`)
  } catch (error) {
    console.error("Failed to cleanup expired files:", error)
  }
}
