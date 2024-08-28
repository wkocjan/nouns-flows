import { unstable_cache } from "next/cache"
import { farcaster } from "./client"

export const getFarcasterUserByEthAddress = unstable_cache(
  async (address: `0x${string}`) => {
    try {
      const users = await farcaster.fetchBulkUsersByEthereumAddress([address])
      if (Object.keys(users).length === 0 || !users[address]) return null

      // get the farcaster account with the most followers
      const user = users[address].sort(
        (a, b) => a.follower_count - b.follower_count,
      )[0]

      return user
    } catch (e: any) {
      console.error(e?.message)
      return null
    }
  },
  undefined,
  { revalidate: 3600 * 24 }, // 1 day
)
