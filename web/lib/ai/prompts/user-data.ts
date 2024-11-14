import { headers } from "next/headers"
import { cache } from "react"
import { getEthAddress } from "@/lib/utils"
import { getFarcasterUsersByEthAddress } from "@/lib/farcaster/get-user"
import { getFarcasterUserChannels } from "@/lib/farcaster/get-user-channels"

export const getUserDataPrompt = cache(async (address?: string) => {
  return `## User data
  
  ${address ? `The address of the user is ${address}. ` : "The user is not logged in."}
  
  ${address ? await getFarcasterAccountPrompt(address) : ""}

  ${getLocationPrompt()}

  ${getUserAgentPrompt()}
  `
})

function getLocationPrompt(): string {
  const country = headers().get("X-Vercel-IP-Country")
  const countryRegion = headers().get("X-Vercel-IP-Country-Region")
  const city = headers().get("X-Vercel-IP-City")

  if (!city && !country && !countryRegion) return ""

  return `### Language and location\n\nHere is the user's location: ${city}, ${country}, ${countryRegion} from geolocation. If the user is not in the US or English speaking country, feel free to ask questions in their language. At the start, you may want to ask user which language they prefer in conversation with you. In the same message do not ask more questions - let the user first pick the language. Do not mention you know the city - it may be not accurate.`
}

function getUserAgentPrompt(): string {
  const userAgent = headers().get("user-agent")
  if (!userAgent) return ""

  return `### User agent\n\nHere is the user agent: ${userAgent}. If the user is on mobile, you should be incredibly concise and to the point. They do not have a lot of time or space to read, so you must be incredibly concise and keep your questions and responses to them short in as few words as possible, unless they ask for clarification or it's otherwise necessary.`
}

async function getFarcasterAccountPrompt(address: string): Promise<string> {
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
