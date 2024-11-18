import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { DateTime } from "@/components/ui/date-time"
import { farcasterDb } from "@/lib/database/farcaster-edge"
import Link from "next/link"

export async function GrantsStories() {
  const casts = (
    await farcasterDb.cast.findMany({
      where: {
        computed_tags: { has: "nouns-flows" },
        embeds: { not: { equals: "[]" } },
      },
      orderBy: { created_at: "desc" },
      take: 20,
      include: { profile: true },
    })
  )
    .map((cast) => ({
      ...cast,
      images: (JSON.parse(cast.embeds || "[]") as Array<{ url?: string }>)
        .filter((embed) => embed.url?.includes("image"))
        .map((embed) => embed.url),
    }))
    .filter((c) => c.images.length > 0)
    .slice(0, 9)

  const [featuredCast, ...otherCasts] = casts

  return (
    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="col-span-2 row-span-2">
        <FeaturedStory cast={featuredCast} />
      </div>
      {otherCasts.map((cast) => (
        <StoryCard key={cast.id} cast={cast} />
      ))}
    </div>
  )
}

function FeaturedStory({ cast }: { cast: any }) {
  return (
    <Card className="h-full overflow-hidden">
      <Link href={`/cast/${cast.id}`} className="group flex h-full flex-col">
        {cast.images[0] && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={cast.images[0]}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col justify-between p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <img src={cast.profile.avatar_url || ""} alt={cast.profile.display_name || ""} />
              </Avatar>
              <div>
                <p className="font-medium">{cast.profile.display_name}</p>
                <p className="text-sm text-muted-foreground">
                  <DateTime date={cast.created_at} relative />
                </p>
              </div>
            </div>
            <h2 className="text-2xl font-bold leading-tight tracking-tight group-hover:text-primary">
              {cast.text.length > 160 ? `${cast.text.slice(0, 160)}...` : cast.text}
            </h2>
          </div>
        </div>
      </Link>
    </Card>
  )
}

function StoryCard({ cast }: { cast: any }) {
  return (
    <Card className="overflow-hidden">
      <Link href={`/cast/${cast.id}`} className="group">
        {cast.images[0] && (
          <div className="h-80 w-full overflow-hidden">
            <img
              src={cast.images[0]}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <img src={cast.profile.avatar_url || ""} alt={cast.profile.display_name || ""} />
            </Avatar>
            <span className="text-sm">{cast.profile.display_name}</span>
          </div>
          <h3 className="mt-3 text-sm group-hover:text-primary">
            {cast.text.length > 80 ? `${cast.text.slice(0, 80)}...` : cast.text}
          </h3>
          {/* <p className="mt-2 text-sm text-muted-foreground">
            <DateTime date={cast.created_at} relative />
          </p> */}
        </div>
      </Link>
    </Card>
  )
}
