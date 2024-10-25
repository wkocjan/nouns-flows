import { Card, CardContent } from "@/components/ui/card"
import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import database from "@/lib/database"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress, isGrantApproved } from "@/lib/utils"
import { VotingProvider } from "@/lib/voting/voting-context"
import Link from "next/link"
import { Suspense } from "react"
import { base } from "viem/chains"
import { FlowsTable } from "./components/flows-table"
import { FlowsUpdates } from "./components/flows-updates"
import { VotingBar } from "./flow/[flowId]/components/voting-bar"
import { CTAButtons } from "./flow/[flowId]/components/cta-buttons"
import { Grant } from "@prisma/client"
import { Status } from "@/lib/enums"

export const revalidate = 0
export const dynamic = "force-dynamic"

export default async function Home() {
  const pool = await getPool()

  const activeFlows = await database.grant.findMany({
    where: { isFlow: 1, isActive: 1, isTopLevel: 0 },
    include: { subgrants: true },
  })

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
                id={pool.id}
                subgrants={pool.subgrants}
                alwaysShowAll
                isTopLevel
                showLabel
              />
            </div>
            <p className="mt-1 text-sm text-muted-foreground max-sm:hidden">{pool.tagline}</p>
          </div>

          <CTAButtons />
        </div>

        <Card className="mb-12 mt-6">
          <CardContent>
            <FlowsTable flows={activeFlows} />
          </CardContent>
        </Card>
        <Suspense>
          <FlowsUpdates />
        </Suspense>
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
