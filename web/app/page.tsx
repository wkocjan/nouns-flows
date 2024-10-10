import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import database from "@/lib/database"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress } from "@/lib/utils"
import { VotingProvider } from "@/lib/voting/voting-context"
import Link from "next/link"
import { base } from "viem/chains"
import { FlowsTable } from "./components/flows-table"
import { VotingBar } from "./flow/[flowId]/components/voting-bar"
import { VotingToggle } from "./flow/[flowId]/components/voting-toggle"
import { FlowsUpdates } from "./components/flows-updates"
import { Suspense } from "react"

export default async function Home() {
  const pool = await getPool()

  const flows = await database.grant.findMany({
    where: { isFlow: 1, isActive: 1, isTopLevel: 0 },
    include: { subgrants: true },
  })

  return (
    <VotingProvider chainId={base.id} contract={getEthAddress(pool.recipient)}>
      <main className="container mt-2.5 pb-24 md:mt-8">
        <div className="flex flex-row items-center justify-between">
          <div>
            <h3 className="font-semibold leading-none tracking-tight md:text-lg">{pool.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-sm:hidden">{pool.tagline}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/flow/${pool.id}/applications`}>
              <Button variant="ghost">Suggest flow</Button>
            </Link>
            <VotingToggle />
          </div>
        </div>

        <Card className="mb-12 mt-6">
          <CardContent>
            <FlowsTable flows={flows} />
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
