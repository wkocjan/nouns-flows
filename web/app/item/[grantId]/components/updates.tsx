import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CastCard } from "@/components/ui/cast-card"
import { FLOWS_CHANNEL_ID, NOUNS_CHANNEL_ID } from "@/lib/config"
import { Cast, Profile } from "@prisma/farcaster"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { PostUpdate } from "./post-update"

interface Props {
  casts: Array<Cast & { profile: Profile }>
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
            This project&apos;s builder hasn&apos;t posted any updates for this project yet. We
            collect updates from /{NOUNS_CHANNEL_ID} or /{FLOWS_CHANNEL_ID} channels on Farcaster.
          </AlertDescription>
        </Alert>
      )}

      {casts.length > 0 && (
        <div className="mt-4 columns-1 gap-2.5 space-y-2.5 sm:columns-2">
          {casts.map((cast) => (
            <CastCard key={cast.hash.toString("hex")} cast={cast} />
          ))}
        </div>
      )}
    </section>
  )
}
