import { VideoPlayer } from "@/components/ui/video-player"
import { getIpfsUrl } from "@/lib/utils"
import Image from "next/image"

interface Props {
  media: Array<{ url: string; alt: string }>
}

export function Media(props: Props) {
  const { media } = props

  if (media.length <= 3) return null

  const columns = media.length % 4 === 0 ? 4 : 5

  return (
    <div
      className="col-span-full grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {media.map(({ url, alt }) => {
        const isVideo = url.endsWith("m3u8")

        return (
          <div className="relative aspect-square overflow-hidden rounded-xl" key={url}>
            {isVideo ? (
              <VideoPlayer
                url={url}
                controls
                className="overflow-hidden rounded-lg object-cover"
                width="100%"
                height="100%"
              />
            ) : (
              <Image
                src={getIpfsUrl(url, "pinata")}
                alt={alt}
                fill
                className="rounded-lg object-cover"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
