import { PrismaClient as FarcasterClient } from "@prisma/farcaster/edge"
import { withAccelerate } from "@prisma/extension-accelerate"

const isDevelopment = process.env.NODE_ENV !== "production"

const farcasterClientSingleton = () => {
  if (isDevelopment) {
    return new FarcasterClient({
      datasources: {
        db: { url: process.env.DATABASE_ACCELERATE_URL },
      },
    }).$extends(withAccelerate())
  }
  return new FarcasterClient().$extends(withAccelerate())
}

declare const globalThis: {
  farcaster: ReturnType<typeof farcasterClientSingleton>
} & typeof global

const farcasterDb = globalThis.farcaster ?? farcasterClientSingleton()

export { farcasterDb }

if (process.env.NODE_ENV !== "production") globalThis.farcaster = farcasterDb
