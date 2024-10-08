import { Cast, EmbedUrl } from "@neynar/nodejs-sdk/build/neynar-api/v2"

export function getCastImages(cast: Cast): string[] {
  return cast.embeds
    .filter((embed): embed is EmbedUrl => "url" in embed)
    .map((embed) => embed.url)
    .filter((url) => url.includes("imagedelivery"))
}
