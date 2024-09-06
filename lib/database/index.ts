import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => new PrismaClient()

declare const globalThis: {
  prisma: ReturnType<typeof prismaClientSingleton>
} & typeof global

const database = globalThis.prisma ?? prismaClientSingleton()

export default database

if (process.env.NODE_ENV !== "production") globalThis.prisma = database
