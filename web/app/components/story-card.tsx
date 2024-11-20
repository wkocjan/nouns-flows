import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { DateTime } from "@/components/ui/date-time"
import { FarcasterUser, Story } from "@prisma/flows"
import Image from "next/image"
import Link from "next/link"

export function StoryCard(props: { story: Story & { user: FarcasterUser | null } }) {
  const { header_image, title, tagline, user, created_at, id } = props.story

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow dark:border dark:bg-card">
      {header_image && (
        <div className="h-32 w-full overflow-hidden rounded-lg md:h-40">
          <Image
            src={header_image}
            alt={title}
            className="size-full object-cover transition-transform group-hover:scale-110"
            width={320}
            height={160}
          />
        </div>
      )}
      <div className="grow p-4">
        <Link
          href={`/story/${id}`}
          className="text-base font-semibold leading-snug group-hover:text-primary"
        >
          {title}
          <span className="absolute inset-0" />
        </Link>
        <p className="mt-1.5 text-sm text-muted-foreground">{tagline}</p>
      </div>

      <div className="flex items-center justify-between space-x-1.5 p-4">
        <div className="flex items-center gap-1.5">
          {user && (
            <>
              <Avatar className="size-5">
                <AvatarImage src={user.imageUrl} alt={user.displayName} />
              </Avatar>
              <span className="text-xs">{user.displayName}</span>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          <DateTime date={created_at} relative short />
        </p>
      </div>
    </div>
  )
}
