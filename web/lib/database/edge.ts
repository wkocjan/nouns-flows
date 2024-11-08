import { PrismaClient as PrismaClientEdge } from "@prisma/flows/edge"
import { withAccelerate } from "@prisma/extension-accelerate"

const isDevelopment = process.env.NODE_ENV !== "production"

const prismaClientSingleton = () => {
  if (isDevelopment) {
    return new PrismaClientEdge({
      datasources: {
        db: { url: process.env.DATABASE_ACCELERATE_URL },
      },
    }).$extends(withAccelerate())
  }
  return new PrismaClientEdge().$extends(withAccelerate())
}

declare const globalThis: {
  prisma: ReturnType<typeof prismaClientSingleton>
} & typeof global

const database = globalThis.prisma ?? prismaClientSingleton()

export default database

if (process.env.NODE_ENV !== "production") globalThis.prisma = database
