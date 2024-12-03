import "server-only"

import { StoryCard } from "@/app/components/story-card"
import { FeaturedStoryCard } from "@/app/components/story-card-featured"
import database, { getCacheStrategy } from "@/lib/database/edge"

interface Props {
  grantId: string
}

export async function GrantStories(props: Props) {
  const { grantId } = props

  const stories = await database.story.findMany({
    where: { complete: true, header_image: { not: null }, grant_ids: { has: grantId } },
    orderBy: { updated_at: "desc" },
    take: 11,
    ...getCacheStrategy(180),
  })

  if (stories.length === 0) return null

  const [featuredStory, ...remainingStories] = stories

  return (
    <div className="col-span-full mt-8">
      <h3 className="text-2xl font-medium">Stories</h3>
      <div className="mt-10 grid grid-cols-1 gap-2.5 md:grid-cols-4">
        {featuredStory && <FeaturedStoryCard story={featuredStory} />}
        {remainingStories.map((story) => (
          <StoryCard story={story} key={story.id} />
        ))}
      </div>
    </div>
  )
}
