import { unstable_cache } from "next/cache"
import { farcaster } from "./client"

export const getFarcasterUserByEthAddress = unstable_cache(
  async (address: `0x${string}`) => {
    try {
      const users = await getFarcasterUsersByEthAddress(address)
      if (users.length === 0) return null

      const user = users.sort((a, b) => a.follower_count - b.follower_count)[0]
      return user
    } catch (e: any) {
      console.error(e?.message)
      return null
    }
  },
  undefined,
  { revalidate: 3600 }, // 1 hour
)

export const getFarcasterUsersByEthAddress = unstable_cache(
  async (rawAddress: `0x${string}`) => {
    try {
      const address = rawAddress.toLowerCase()

      const users = await farcaster.fetchBulkUsersByEthereumAddress([address])
      if (Object.keys(users).length === 0 || !users[address]) return []

      return users[address]
    } catch (e: any) {
      console.error(e?.message)
      return []
    }
  },
  undefined,
  { revalidate: 3600 }, // 1 hour
)
