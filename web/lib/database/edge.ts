import { PrismaClient as PrismaClientEdge } from "@prisma/flows/edge"
import { PrismaClient as PrismaClientLocal } from "@prisma/flows"
import { withAccelerate } from "@prisma/extension-accelerate"
import { withOptimize } from "@prisma/extension-optimize"

const isDevelopment = process.env.NODE_ENV !== "production"
const optimizeApiKey = process.env.PRISMA_OPTIMIZE_KEY

if (!optimizeApiKey) {
  throw new Error("PRISMA_OPTIMIZE_KEY is not set")
}

const getAccelerateClient = () => {
  return new PrismaClientEdge()
    .$extends(withAccelerate())
    .$extends(withOptimize({ apiKey: optimizeApiKey }))
}

const prismaClientSingleton = () => {
  if (isDevelopment) {
    return new PrismaClientLocal()
  }
  return getAccelerateClient()
}

declare const globalThis: {
  prisma: ReturnType<typeof getAccelerateClient>
} & typeof global

const database = globalThis.prisma ?? prismaClientSingleton()

export default database

if (process.env.NODE_ENV !== "production") globalThis.prisma = database

export const getCacheStrategy = (swr?: number, ttl?: number) => {
  return isDevelopment ? {} : { cacheStrategy: { swr, ttl } }
}
