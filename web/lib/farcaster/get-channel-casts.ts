import { Cast } from "@neynar/nodejs-sdk/build/neynar-api/v2"
import { farcaster } from "./client"

export async function getFarcasterChannelCasts(channelId: string, limit = 100): Promise<Cast[]> {
  try {
    const allCasts: Cast[] = []
    let cursor: string | undefined

    while (allCasts.length < limit) {
      const take = Math.min(100, limit - allCasts.length)

      console.debug(`Getting ${take} casts for ${channelId}`)

      const { casts, next } = await farcaster.fetchFeed("filter", {
        channelId,
        limit: take,
        filterType: "channel_id",
        cursor,
      })

      allCasts.push(...casts)

      if (!next || casts.length < take) break

      await new Promise((resolve) => setTimeout(resolve, 500))
      cursor = next.cursor ?? undefined
    }

    console.debug(`Got ${allCasts.length} casts for ${channelId}.`)

    return allCasts.slice(0, limit)
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : String(error))
    return []
  }
}
