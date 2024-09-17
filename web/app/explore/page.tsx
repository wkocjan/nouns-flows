import { NOUNS_FLOW_PROXY } from "@/lib/config"
import database from "@/lib/database"
import { FullDiagram } from "./diagram"
import { l2Client } from "@/lib/viem/client"
import { NounsFlowAbi } from "@/lib/wagmi/abi"
import { formatEther } from "viem"
import { unstable_cache } from "next/cache"

export default async function ExplorePage() {
  const flows = await database.grant.findMany({
    where: { isRemoved: 0, isFlow: 1, parent: NOUNS_FLOW_PROXY },
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
      address: NOUNS_FLOW_PROXY,
      abi: NounsFlowAbi,
      functionName: "getTotalFlowRate",
    })

    return formatEther(totalFlowRate * BigInt(60 * 60 * 24 * 30))
  },
  ["monthly-flow-rate", NOUNS_FLOW_PROXY],
  { revalidate: 600 }, //  10 minutes
)
