import "server-only"

import { cache } from "react"
import { farcaster } from "./client"

export const getFarcasterUserChannels = cache(async (fid: number) => {
  try {
    const { channels } = await farcaster.fetchUserChannels(fid, { limit: 100 })
    return channels
  } catch (e: any) {
    console.error(e?.message)
    return []
  }
})
