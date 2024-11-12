import { EmbedUrl } from "@neynar/nodejs-sdk/build/neynar-api/v2"
import { Cast } from "@prisma/farcaster"

export function getCastImages(cast: Cast): string[] {
  return JSON.parse(cast.embeds || "[]")
    .filter((embed: EmbedUrl): embed is EmbedUrl => "url" in embed)
    .map((embed: EmbedUrl) => embed.url)
    .filter((url: string) => url.includes("imagedelivery"))
}
