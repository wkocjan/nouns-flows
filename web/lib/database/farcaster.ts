import { PrismaClient as FarcasterClient } from "@prisma/farcaster"
import { withAccelerate } from "@prisma/extension-accelerate"

const farcasterClientSingleton = () => new FarcasterClient().$extends(withAccelerate())

declare const globalThis: {
  farcaster: ReturnType<typeof farcasterClientSingleton>
} & typeof global

const farcasterDb = globalThis.farcaster ?? farcasterClientSingleton()

export { farcasterDb }

if (process.env.NODE_ENV !== "production") globalThis.farcaster = farcasterDb
