import database from "@/lib/database/edge"
import { getPool } from "@/lib/database/queries/pool"
import { FullDiagram } from "./diagram"
import { Metadata } from "next"

export const runtime = "nodejs"

export async function generateMetadata(): Promise<Metadata> {
  const pool = await getPool()
  return {
    title: `Explore - ${pool.title}`,
    description: `Diagram of all flows in ${pool.title} `,
  }
}

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
