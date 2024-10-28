import { VideoPlayer } from "@/components/ui/video-player"
import { getPool } from "@/lib/database/queries/pool"
import { Metadata } from "next"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDownIcon } from "@radix-ui/react-icons"

export async function generateMetadata(): Promise<Metadata> {
  const pool = await getPool()
  return {
    title: `About | ${pool.title}`,
    description: "Learn more about the flows program and how to apply for funding.",
  }
}

export default function AboutPage() {
  return (
    <main className="container mt-2.5 md:mt-16">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 pb-16 md:grid-cols-2">
        <Collapsible className="col-span-full" defaultOpen>
          <Category title="About" />
          <CollapsibleContent>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <Video
                url="https://stream.warpcast.com/v1/video/a5501c8b4a94b104840de30618f4cf1e.m3u8"
                title="An introduction to flows.wtf"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="col-span-full">
          <Category title="For builders" />
          <CollapsibleContent>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
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
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="col-span-full">
          <Category title="For Nouns DAO members" />
          <CollapsibleContent>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
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
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="col-span-full">
          <Category title="For curators 🚀" />
          <CollapsibleContent>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <Video
                url="https://stream.warpcast.com/v1/video/467bb7a5dffa6583bcd7c8c364fa2953.m3u8"
                title="What does it mean to be a curator"
              />

              <Video
                url="https://stream.warpcast.com/v1/video/c44694c683984096eb2cc6e2d64a431f.m3u8"
                title="A note for curators"
              />

              <Video
                url="https://stream.warpcast.com/v1/video/227a7cf3795eae622be082101ece4b92.m3u8"
                title="How to earn money as a curator 🎯"
              />

              <Video
                url="https://stream.warpcast.com/v1/video/3b7ce7b89824d5c96cc986641fb106e1.m3u8"
                title="How to earn money via challenge rewards (pt. 1)"
              />

              <Video
                url="https://stream.warpcast.com/v1/video/c4c3adf88fb08a5614f911cff4ac034a.m3u8"
                title="How to earn money via challenge rewards (pt. 2)"
              />

              <Video
                url="https://stream.warpcast.com/v1/video/91d414606e71311b99793846b766b726.m3u8"
                title="How to earn money via challenge rewards (pt. 3)"
              />

              <Video
                url="https://stream.warpcast.com/v1/video/8caf65635c3e1ffb738d639b1e361d52.m3u8"
                title="How to earn money from pool rewards"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </main>
  )
}

function Category(props: { title: string }) {
  const { title } = props
  return (
    <CollapsibleTrigger className="w-full">
      <h2 className="flex items-center justify-between border-b pb-2.5 text-xl font-medium tracking-tight md:text-2xl">
        {title}
        <ChevronDownIcon className="size-5" />
      </h2>
    </CollapsibleTrigger>
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
