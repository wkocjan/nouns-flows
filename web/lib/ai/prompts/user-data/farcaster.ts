import { unstable_cache } from "next/cache"
import { getEthAddress } from "@/lib/utils"

const getFarcasterUsersByEthAddress = unstable_cache(
  async (rawAddress: `0x${string}`) => {
    try {
      const address = rawAddress.toLowerCase()

      const response = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
        {
          headers: {
            accept: "application/json",
            "x-api-key": process.env.NEYNAR_API_KEY || "",
          },
        },
      )

      const data = await response.json()
      if (!data[address]) return []

      return data[address]
    } catch (e: any) {
      console.error(e?.message)
      return []
    }
  },
  undefined,
  { revalidate: 3600 }, // 1 hour
)

export async function getFarcasterPrompt(address: string) {
  const farcasterUsers = (await getFarcasterUsersByEthAddress(getEthAddress(address))).map(
    (u: any) => ({
      username: u.username,
      displayName: u.display_name,
      bio: u.profile?.bio?.text,
      followerCount: u.follower_count,
      followingCount: u.following_count,
    }),
  )

  if (farcasterUsers.length === 0) return ""

  return `Here is the list of Farcaster users that are connected to the ${address}: ${JSON.stringify(farcasterUsers)}. You may learn something about the user from this information.
  
    If the user has exactly one Farcaster account connected to the address, you can use it for the application. Inform briefly the user that their Farcaster account will be used for the application. If user has more Farcaster accounts, you can ask them to pick one.
    
    In context of Farcaster account please refer to the 'username' field (@username), not 'displayName'.`
}
