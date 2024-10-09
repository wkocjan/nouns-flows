"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DateTime } from "@/components/ui/date-time"
import { Cast, FarcasterUser } from "@prisma/client"
import Linkify from "linkify-react"
import dynamic from "next/dynamic"

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false })

interface Props {
  cast: Cast & { user: FarcasterUser }
}

export const CastCard = (props: Props) => {
  const { cast } = props

  return (
    <Card className="w-full">
      <CardHeader className="flex w-full flex-row items-center justify-between space-x-2.5 space-y-0 pb-2">
        <a
          className="flex items-center space-x-2.5 truncate transition-opacity hover:opacity-80"
          href={`https://warpcast.com/${cast.user.username}`}
          target="_blank"
        >
          <Avatar className="size-8">
            <AvatarImage src={cast.user.imageUrl} alt={cast.user.displayName} />
            <AvatarFallback>{cast.user.displayName[0]}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-semibold">{cast.user.displayName}</span>
        </a>
        <a
          href={`https://warpcast.com/${cast.user.username}/${cast.hash}`}
          target="_blank"
          className="shrink-0 transition-opacity hover:opacity-80"
        >
          <DateTime date={cast.createdAt} relative className="text-sm text-muted-foreground" />
        </a>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-line text-sm">
          <Linkify
            options={{
              className:
                "hover:underline duration-100 break-all text-primary transition-colors leading-loose",
              target: "_blank",
            }}
          >
            {cast.text}
          </Linkify>
        </div>
        {(cast.videos?.length > 0 || cast.images?.length > 0) && (
          <div className="mt-4 grid grid-cols-1 gap-2.5">
            {cast.videos?.map((video) => (
              <div key={video} className="h-auto w-full">
                <ReactPlayer url={video} width="100%" height="100%" controls />
              </div>
            ))}
            {cast.images?.map((image) => (
              <a
                href={image}
                key={image}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt=""
                  className="h-auto w-full max-w-full rounded-lg"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
