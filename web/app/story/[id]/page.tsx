import "server-only"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { DateTime } from "@/components/ui/date-time"
import { Markdown } from "@/components/ui/markdown"
import { VideoPlayer } from "@/components/ui/video-player"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { getIpfsUrl } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { cache } from "react"
import { KeyPoints } from "./components/key-points"
import { Sources } from "./components/sources"

interface Props {
  params: { id: string }
}

const getStory = cache(async (id: string) => {
  return await database.story.findUniqueOrThrow({
    where: { id },
    include: { grant: true, user: true, flow: true },
    ...getCacheStrategy(240),
  })
})

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = props.params

  const story = await getStory(id)

  return {
    title: story.title,
    description: story.tagline,
    ...(story.header_image ? { openGraph: { images: [story.header_image] } } : {}),
  }
}

export default async function Page(props: Props) {
  const { id } = props.params

  const story = await getStory(id)

  const { user, title, grant, key_points, updated_at, flow, timeline, sources } = story

  return (
    <article className="container mt-2.5 max-w-6xl pb-12 md:mt-6 md:pb-24">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Flows</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink href={`/flow/${flow.id}`}>{flow.title}</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator className="max-sm:hidden" />

          <BreadcrumbItem className="max-sm:hidden">
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mt-8 max-w-2xl">
        <h1 className="text-pretty text-2xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-2 text-pretty text-lg text-muted-foreground md:text-xl">{story.tagline}</p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <section className="flex items-center justify-between">
            {user && (
              <div className="flex items-center space-x-3">
                <Avatar className="size-10">
                  <AvatarImage src={user.imageUrl} alt={user.displayName} />
                  <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.ceil(story.summary.split(" ").length / 200)} min read
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center text-xs leading-none text-muted-foreground md:text-sm">
              <CalendarIcon className="mr-2 size-3" />
              <DateTime date={updated_at} relative />
            </div>
          </section>

          <Carousel className="mt-4 w-full">
            <CarouselContent>
              {story.media_urls.map((url, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-video">
                    {url.endsWith(".m3u8") ? (
                      <VideoPlayer
                        url={url}
                        controls
                        className="overflow-hidden rounded-lg"
                        width="100%"
                        height="100%"
                      />
                    ) : (
                      <Image src={url} alt="" fill className="rounded-lg object-cover" />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {story.media_urls.length > 1 && (
              <div className="mt-2.5 flex items-center justify-end space-x-1.5">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            )}
          </Carousel>

          <KeyPoints key_points={key_points} className="mb-12 mt-4 md:hidden" />

          <div className="my-8 space-y-5 text-pretty text-sm md:text-base [&>p]:text-foreground/75">
            <Markdown>{story.summary}</Markdown>
            <Sources sources={sources} />
          </div>

          {timeline && Array.isArray(timeline) && timeline.length > 0 && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="mb-4 text-lg font-semibold md:text-xl">Timeline</h2>
              <div className="relative space-y-4 pl-7">
                <div className="absolute inset-y-2 left-2 w-0.5 bg-secondary"></div>
                {(timeline as Array<{ timestamp: string; event: string }>).map((item) => (
                  <div key={item.timestamp} className="relative">
                    <div className="absolute -left-6 top-1 size-2.5 rounded-full bg-primary"></div>
                    <time className="block text-sm text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </time>
                    <p className="mt-1 text-sm font-medium">{item.event}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6 md:col-span-4">
          {grant && flow && (
            <div className="flex items-center gap-4 rounded-xl border border-secondary p-3">
              {grant.image && (
                <Image
                  src={getIpfsUrl(grant.image, "pinata")}
                  alt={grant.title}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div className="flex flex-col space-y-1">
                <Link
                  href={`/item/${grant.id}`}
                  className="text-sm font-medium leading-tight hover:underline"
                >
                  {grant.title}
                </Link>
                <Link
                  href={`/flow/${flow.id}`}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  {flow.title}
                </Link>
              </div>
            </div>
          )}

          <KeyPoints key_points={key_points} className="max-sm:hidden" />
        </aside>
      </div>
    </article>
  )
}
