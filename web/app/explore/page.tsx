import database from "@/lib/database"
import { FullDiagram } from "./diagram"

export default async function ExplorePage() {
  const grants = await database.grant.findMany({
    where: { isRemoved: 0 },
  })

  return (
    <main className="flex grow flex-col">
      <FullDiagram grants={grants} />
    </main>
  )
}
