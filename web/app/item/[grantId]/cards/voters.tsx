import "server-only"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database/edge"

interface Props {
  contract: `0x${string}`
  recipientId: string
  flowVotesCount: string
  isFlow?: boolean
}

export const Voters = async (props: Props) => {
  const { contract, recipientId, flowVotesCount, isFlow } = props

  const voters = await database.$queryRaw<{ voter: `0x${string}`; votesCount: number }[]>`
    SELECT voter, SUM(CAST("votesCount" AS INTEGER)) as "votesCount"
    FROM "Vote"
    WHERE "contract" = ${contract} AND "recipientId" = ${recipientId} AND "isStale" = 0
    GROUP BY voter    
  `

  return (
    <div className="grow rounded-xl border bg-white/50 p-5 dark:bg-transparent">
      <h3 className="mb-4 font-medium">Voters</h3>
      {voters.length === 0 && (
        <div className="text-sm text-muted-foreground">
          There are no direct votes for this {isFlow ? "flow" : "grant"} yet.
          <br />
          <br />
          {!isFlow &&
            `The budget is a minimal support based on the ${flowVotesCount} votes for the parent flow.`}
        </div>
      )}
      {voters.length > 0 && (
        <div className="grid gap-x-4 gap-y-6 lg:grid-cols-2">
          {voters.map((v) => (
            <UserProfile address={v.voter} key={v.voter}>
              {(profile) => (
                <div className="flex items-center">
                  <Avatar className="mr-2.5 size-7 rounded-full bg-primary">
                    <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                  </Avatar>

                  <div className="flex flex-col">
                    <span className="mr-1.5 truncate text-sm font-medium">
                      {profile.display_name}
                    </span>
                    <span className="text-xs text-muted-foreground">{v.votesCount} votes</span>
                  </div>
                </div>
              )}
            </UserProfile>
          ))}
        </div>
      )}
    </div>
  )
}
