import { PrismaClient as PrismaClientEdge } from "@prisma/flows/edge"
import { PrismaClient as PrismaClientLocal } from "@prisma/flows"

import { withAccelerate } from "@prisma/extension-accelerate"

const isDevelopment = process.env.NODE_ENV !== "production"

const getAccelerateClient = () => {
  return new PrismaClientEdge().$extends(withAccelerate())
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

export const getPageRuntime = () => {
  return isDevelopment ? "nodejs" : "edge"
}

export const getCacheStrategy = (swr?: number, ttl?: number) => {
  return isDevelopment ? {} : { swr, ttl }
}
