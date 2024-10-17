import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import database from "@/lib/database"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress } from "@/lib/utils"
import { VotingProvider } from "@/lib/voting/voting-context"
import Link from "next/link"
import { Suspense } from "react"
import { base } from "viem/chains"
import { FlowsTable } from "./components/flows-table"
import { FlowsUpdates } from "./components/flows-updates"
import { VotingBar } from "./flow/[flowId]/components/voting-bar"
import { VotingToggle } from "./flow/[flowId]/components/voting-toggle"

export default async function Home() {
  const pool = await getPool()

  const activeFlows = await database.grant.findMany({
    where: { isFlow: 1, isActive: 1, isTopLevel: 0 },
    include: { subgrants: true },
  })

  return (
    <VotingProvider chainId={base.id} contract={getEthAddress(pool.recipient)}>
      <main className="container mt-2.5 pb-24 md:mt-8">
        <div className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center space-x-4">
              <h3 className="font-semibold leading-none tracking-tight md:text-lg">
                <Link href={`/flow/${pool.id}`} className="hover:text-primary">
                  {pool.title}
                </Link>
              </h3>
              <GrantStatusCountBadges
                subgrants={pool.subgrants}
                alwaysShowAll
                isTopLevel
                showLabel
              />
            </div>
            <p className="mt-1 text-sm text-muted-foreground max-sm:hidden">{pool.tagline}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/apply/${pool.id}`}>
              <Button variant="ghost">Suggest flow</Button>
            </Link>
            <VotingToggle />
          </div>
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
