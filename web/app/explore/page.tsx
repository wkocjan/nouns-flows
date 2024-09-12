import { NOUNS_FLOW_PROXY } from "@/lib/config"
import database from "@/lib/database"
import { FullDiagram } from "./diagram"

export default async function ExplorePage() {
  const flows = await database.grant.findMany({
    where: { isRemoved: 0, isFlow: 1, parent: NOUNS_FLOW_PROXY },
    include: {
      subgrants: { where: { isFlow: 0, isRemoved: 0 } },
    },
  })

  return (
    <main className="flex grow flex-col">
      <FullDiagram flows={flows} />
    </main>
  )
}
