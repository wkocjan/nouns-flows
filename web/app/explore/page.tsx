import { NOUNS_FLOW } from "@/lib/config"
import database from "@/lib/database"
import { getPool } from "@/lib/database/queries/get-pool"
import { FullDiagram } from "./diagram"

export default async function ExplorePage() {
  const flows = await database.grant.findMany({
    where: { isRemoved: 0, isFlow: 1, parent: NOUNS_FLOW },
    include: { subgrants: { where: { isFlow: 0, isRemoved: 0 } } },
  })

  const pool = await getPool()

  return (
    <main className="flex grow flex-col">
      <FullDiagram flows={flows} pool={pool} />
    </main>
  )
}
