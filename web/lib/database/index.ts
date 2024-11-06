import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"

const prismaClientSingleton = () => new PrismaClient().$extends(withAccelerate())

declare const globalThis: {
  prisma: ReturnType<typeof prismaClientSingleton>
} & typeof global

const database = globalThis.prisma ?? prismaClientSingleton()

export default database

if (process.env.NODE_ENV !== "production") globalThis.prisma = database
