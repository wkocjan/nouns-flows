import { getFarcasterUserByEthAddress } from "@/lib/farcaster/getUser"
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
    username: user?.username,
    pfp_url: user?.pfp_url,
    bio: user?.profile?.bio.text,
  }
}
