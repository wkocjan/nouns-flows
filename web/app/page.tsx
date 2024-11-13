import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import { getUser } from "@/lib/auth/user"
import database from "@/lib/database/edge"
import { getPool } from "@/lib/database/queries/pool"
import { Status } from "@/lib/enums"
import { getEthAddress, isGrantApproved } from "@/lib/utils"
import { VotingProvider } from "@/lib/voting/voting-context"
import { Grant } from "@prisma/flows"
import Link from "next/link"
import { base } from "viem/chains"
import { ActionCard } from "./components/action-card/action-card"
import FlowsList from "./components/flows-list"
import { CTAButtons } from "./flow/[flowId]/components/cta-buttons"
import { VotingBar } from "./flow/[flowId]/components/voting-bar"
import { FlowsUpdates } from "./components/flows-updates"

export const runtime = "edge"

export const revalidate = 0
export const dynamic = "force-dynamic"

export default async function Home() {
  const [pool, activeFlows, user] = await Promise.all([
    getPool(),
    database.grant.findMany({
      where: { isFlow: 1, isActive: 1, isTopLevel: 0 },
      include: { subgrants: true },
      cacheStrategy: { swr: 120 },
    }),
    getUser(),
  ])

  // sort by monthlyIncomingFlowRate
  activeFlows.sort(sortGrants)

  return (
    <VotingProvider chainId={base.id} contract={getEthAddress(pool.recipient)}>
      <main className="container mt-2.5 pb-24 md:mt-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4">
              <h3 className="font-semibold leading-none tracking-tight md:text-lg">
                <Link href={`/flow/${pool.id}`} className="hover:text-primary">
                  {pool.title}
                </Link>
              </h3>
              <GrantStatusCountBadges
                subgrants={pool.subgrants}
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
          <FlowsList actionCard={<ActionCard user={user} />} flows={activeFlows} />
        </div>

        <div className="mt-12">
          <FlowsUpdates />
        </div>
      </main>
      <VotingBar />
    </VotingProvider>
  )
}
function sortGrants(a: Grant & { subgrants: Grant[] }, b: Grant & { subgrants: Grant[] }) {
  const aIsClearingRequested = a.status === Status.ClearingRequested
  const bIsClearingRequested = b.status === Status.ClearingRequested
  if (aIsClearingRequested && !bIsClearingRequested) {
    return -1
  } else if (!aIsClearingRequested && bIsClearingRequested) {
    return 1
  } else {
    const aApprovedCount = a.subgrants.filter(isGrantApproved).length
    const bApprovedCount = b.subgrants.filter(isGrantApproved).length
    if (aApprovedCount !== bApprovedCount) {
      return bApprovedCount - aApprovedCount
    }
    return Number(b.monthlyIncomingFlowRate) - Number(a.monthlyIncomingFlowRate)
  }
}
