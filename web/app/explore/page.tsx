import { nounsFlowImplAbi } from "@/lib/abis"
import { NOUNS_FLOW } from "@/lib/config"
import database from "@/lib/database"
import { l2Client } from "@/lib/viem/client"
import { unstable_cache } from "next/cache"
import { formatEther } from "viem"
import { FullDiagram } from "./diagram"

export default async function ExplorePage() {
  const flows = await database.grant.findMany({
    where: { isRemoved: 0, isFlow: 1, parent: NOUNS_FLOW },
    include: {
      subgrants: { where: { isFlow: 0, isRemoved: 0 } },
    },
  })

  const budget = await getMonthlyFlowRate()

  return (
    <main className="flex grow flex-col">
      <FullDiagram flows={flows} budget={Number(budget)} />
    </main>
  )
}

const getMonthlyFlowRate = unstable_cache(
  async () => {
    const totalFlowRate = await l2Client.readContract({
      address: NOUNS_FLOW,
      abi: nounsFlowImplAbi,
      functionName: "getTotalFlowRate",
    })

    return formatEther(totalFlowRate * BigInt(60 * 60 * 24 * 30))
  },
  ["monthly-flow-rate", NOUNS_FLOW],
  { revalidate: 600 }, //  10 minutes
)
