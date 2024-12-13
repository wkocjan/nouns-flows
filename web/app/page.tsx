import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { isGrantApproved } from "@/lib/database/helpers"
import { getPool } from "@/lib/database/queries/pool"
import { Status } from "@/lib/enums"
import { getEthAddress } from "@/lib/utils"
import { VotingProvider } from "@/lib/voting/voting-context"
import { Grant } from "@prisma/flows"
import Link from "next/link"
import { base } from "viem/chains"
import FlowsList from "./components/flows-list"
import { FlowsStories } from "./components/flows-stories"
import { CTAButtons } from "./flow/[flowId]/components/cta-buttons"
import { VotingBar } from "./flow/[flowId]/components/voting-bar"

export default async function Home() {
  const [pool, activeFlows] = await Promise.all([
    getPool(),
    database.grant.findMany({
      where: { isFlow: true, isActive: true, isTopLevel: false },
      ...getCacheStrategy(120),
    }),
  ])

  activeFlows.sort(sortGrants)

  return (
    <VotingProvider chainId={base.id} contract={getEthAddress(pool.recipient)}>
      <main className="container pb-24">
        <FlowsStories />

        <div className="mt-12 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4">
              <h3 className="font-semibold leading-none tracking-tight md:text-lg">
                <Link href={`/flow/${pool.id}`} className="hover:text-primary">
                  Explore Flows
                </Link>
              </h3>
              <GrantStatusCountBadges
                subgrants={activeFlows}
                id={pool.id}
                flow={pool}
                alwaysShowAll
                isTopLevel
                showLabel
              />
            </div>
            <p className="mt-1 text-sm text-muted-foreground max-sm:hidden">{pool.tagline}</p>
          </div>

          <CTAButtons />
        </div>

        <div className="mt-6">
          <FlowsList flows={activeFlows} />
        </div>
      </main>
      <VotingBar />
    </VotingProvider>
  )
}

function sortGrants(a: Grant, b: Grant) {
  const aApproved = a.activeRecipientCount
  const bApproved = b.activeRecipientCount
  const aChallenged = a.challengedRecipientCount
  const bChallenged = b.challengedRecipientCount
  const aAwaiting = a.awaitingRecipientCount
  const bAwaiting = b.awaitingRecipientCount

  if (aApproved !== bApproved) {
    return bApproved - aApproved
  } else if (aChallenged !== bChallenged) {
    return bChallenged - aChallenged
  } else if (aAwaiting !== bAwaiting) {
    return bAwaiting - aAwaiting
  } else {
    return 0
  }
}
