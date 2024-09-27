import database from "@/lib/database"
import { getPool } from "@/lib/database/queries/pool"
import { FullDiagram } from "./diagram"

export default async function ExplorePage() {
  const flows = await database.grant.findMany({
    where: { isActive: 1, isFlow: 1, isTopLevel: 0 },
    include: { subgrants: { where: { isActive: 1 } } },
  })

  const pool = await getPool()

  return (
    <main className="flex grow flex-col">
      <FullDiagram flows={flows} pool={pool} />
    </main>
  )
}
