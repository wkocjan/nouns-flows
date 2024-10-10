import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CastCard } from "@/components/ui/cast-card"
import { FARCASTER_CHANNEL_ID } from "@/lib/config"
import { Cast, FarcasterUser } from "@prisma/client"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { PostUpdate } from "./post-update"

interface Props {
  casts: Array<Cast & { user: FarcasterUser }>
  recipient: string
}

export const Updates = (props: Props) => {
  const { casts, recipient } = props

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold md:text-2xl">Updates</h2>
        <PostUpdate recipient={recipient} />
      </div>

      {casts.length === 0 && (
        <Alert variant="warning" className="max-w-screen-sm">
          <ExclamationTriangleIcon className="size-4" />
          <AlertTitle className="text-base">No updates yet</AlertTitle>
          <AlertDescription>
            The grantee hasn&apos;t posted any updates for this grant yet. We collect updates from
            the /{FARCASTER_CHANNEL_ID} channel on Farcaster.
          </AlertDescription>
        </Alert>
      )}

      {casts.length > 0 && (
        <div className="mt-4 columns-1 gap-2.5 space-y-2.5 sm:columns-2 lg:columns-3 xl:columns-4">
          {casts.map((cast) => (
            <CastCard key={cast.hash} cast={cast} />
          ))}
        </div>
      )}
    </section>
  )
}
