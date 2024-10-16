import { VideoPlayer } from "@/components/ui/video-player"
import { getPool } from "@/lib/database/queries/pool"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const pool = await getPool()
  return {
    title: `About | ${pool.title}`,
    description: "Learn more about the flows program and how to apply for funding.",
  }
}

export default function AboutPage() {
  return (
    <main className="container mt-2.5 md:mt-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 pb-16 md:grid-cols-2">
        <Category title="About" />

        <Video
          url="https://stream.warpcast.com/v1/video/a5501c8b4a94b104840de30618f4cf1e.m3u8"
          title="An introduction to flows.wtf"
        />

        <Category title="For builders" />

        <Video
          url="https://stream.warpcast.com/v1/video/1f913f31252eec4c3f6e6c2f932c718d.m3u8"
          title="How to get funded (pt 1)"
        />
        <Video
          url="https://stream.warpcast.com/v1/video/a2dbf2b1c0c15f8abc0d554e7be33e66.m3u8"
          title="How to get funded (pt 2)"
        />

        <Video
          url="https://stream.warpcast.com/v1/video/6223c399af95ec5cdd7a0e875a2db5d4.m3u8"
          title="How to post updates"
        />

        <Video
          url="https://stream.warpcast.com/v1/video/a62b377703bc26d7f6e4216d7ff93ff1.m3u8"
          title="How to pay application fee"
        />

        <Video
          url="https://stream.warpcast.com/v1/video/cbfcb5759cfc97f540aa148f82f5ddcd.m3u8"
          title="How to claim your salary"
        />

        <Category title="For Nouns DAO members" />

        <Video
          url="https://stream.warpcast.com/v1/video/0dee1ffd9a47f9034294fb539f98b2f1.m3u8"
          title="How to vote (pt. 1) ⌐◨-◨"
        />

        <Video
          url="https://stream.warpcast.com/v1/video/e9fa8d75917d1fc84e4bc2f515999f2e.m3u8"
          title="How to vote (pt. 2) ⌐◨-◨"
        />

        <Video
          url="https://stream.warpcast.com/v1/video/ba088294ab1a31aa1eda868ea669ba29.m3u8"
          title="How to suggest a flow ⌐◨-◨"
        />

        <Category title="For curators 🚀" />
      </div>
    </main>
  )
}

function Category(props: { title: string }) {
  const { title } = props
  return (
    <h2 className="col-span-full mt-8 border-b pb-2.5 text-lg font-medium tracking-tight md:text-xl">
      {title}
    </h2>
  )
}

function Video(props: { url: string; title: string }) {
  const { url, title } = props
  return (
    <div>
      <div className="mt-2.5 aspect-video rounded-lg bg-black/80">
        <VideoPlayer
          url={url}
          controls
          width="100%"
          height="100%"
          style={{ objectFit: "cover", borderRadius: "var(--radius)", overflow: "hidden" }}
          playsinline={true}
        />
      </div>
      <h3 className="mt-2.5 text-center text-muted-foreground max-sm:text-sm">{title}</h3>
    </div>
  )
}
