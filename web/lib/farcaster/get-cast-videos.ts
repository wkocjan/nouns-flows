import { Cast, EmbedUrl } from "@neynar/nodejs-sdk/build/neynar-api/v2"

export function getCastVideos(cast: Cast): string[] {
  return cast.embeds
    .filter((embed): embed is EmbedUrl => "url" in embed && "metadata" in embed)
    .filter(
      (embed) =>
        embed.metadata?.content_type === "application/x-mpegurl" || embed.url.endsWith(".m3u8"),
    )
    .map((embed) => embed.url)
}
