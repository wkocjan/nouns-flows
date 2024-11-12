import { getEthAddress } from "@/lib/utils"
import { getFarcasterUsersByEthAddress } from "@/lib/farcaster/get-user"
import { getFarcasterUserChannels } from "@/lib/farcaster/get-user-channels"

export async function getFarcasterPrompt(address: string): Promise<string> {
  const farcasterUsers = (await getFarcasterUsersByEthAddress(getEthAddress(address))).map((u) => ({
    username: u.fname,
    displayName: u.display_name,
    bio: u.bio,
    avatarUrl: u.avatar_url,
    fid: Number(u.fid), // Convert BigInt to Number for JSON serialization
  }))

  if (farcasterUsers.length === 0) return ""

  const channelIds = []
  for (const user of farcasterUsers) {
    const channels = await getFarcasterUserChannels(user.fid)
    channelIds.push(...channels.map((c) => c.channelId))
  }

  return `Here is the list of Farcaster users that are connected to the ${address}: ${JSON.stringify(farcasterUsers)}. You may learn something about the user from this information.
  
    The user is a member of the following Farcaster channels: ${JSON.stringify(Array.from(new Set(channelIds)))}.
  
    If the user has exactly one Farcaster account connected to the address, you can use it for the application. Inform briefly the user that their Farcaster account will be used for the application. If user has more Farcaster accounts, you can ask them to pick one.
    
    In context of Farcaster account please refer to the 'username' field (@username), not 'displayName'.`
}
