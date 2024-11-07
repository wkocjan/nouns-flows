import { unstable_cache } from "next/cache"
import { farcasterDb } from "@/lib/database/farcaster"

export const getFarcasterUserByEthAddress = unstable_cache(
  async (address: `0x${string}`) => {
    try {
      const users = await getFarcasterUsersByEthAddress(address)
      if (!users || users.length === 0) return null

      return users[0]
    } catch (e: any) {
      console.error(e?.message)
      return null
    }
  },
  undefined,
  { revalidate: 600 }, // 10 minutes
)

export const getFarcasterUsersByEthAddress = unstable_cache(
  async (rawAddress: `0x${string}`) => {
    try {
      const address = rawAddress.toLowerCase()

      const users = await farcasterDb.farcasterProfile.findMany({
        where: {
          verified_addresses: {
            has: address,
          },
        },
        cacheStrategy: { ttl: 600 },
      })

      return users
    } catch (e: any) {
      console.error(e?.message)
      return []
    }
  },
  undefined,
  { revalidate: 3600 }, // 1 hour
)
