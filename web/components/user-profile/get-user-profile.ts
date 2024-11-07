import { getFarcasterUserByEthAddress } from "@/lib/farcaster/get-user"
import { getShortEthAddress } from "@/lib/utils"

export type Profile = {
  address: `0x${string}`
  display_name: string
  username?: string
  pfp_url?: string
  bio?: string
}

export async function getUserProfile(address: `0x${string}`): Promise<Profile> {
  const user = await getFarcasterUserByEthAddress(address)

  return {
    address,
    display_name: user?.display_name || getShortEthAddress(address),
    username: user?.fname || undefined,
    pfp_url: user?.avatar_url || undefined,
    bio: user?.bio || undefined,
  }
}
