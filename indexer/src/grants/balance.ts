import { ponder } from "@/generated"
import { getClaimableBalance } from "./lib/claimable-balance"
import { getMonthlyFlowRate } from "./lib/monthly-flow"
import { getTotalEarned } from "./lib/total-earned"

ponder.on("Balance:block", async (params) => {
  const { event, context } = params

  const { items } = await context.db.Grant.findMany({
    limit: 15,
    orderBy: { updatedAt: "asc" },
    where: { isActive: true },
  })

  for (const grant of items) {
    const { parentContract, recipient, isFlow, isTopLevel } = grant
    const contract = isTopLevel ? recipient : parentContract
    const flowRateContract = isFlow ? recipient : parentContract

    const [totalEarned, monthlyFlowRate, claimableBalance] = await Promise.all([
      getTotalEarned(context, contract, recipient),
      // pull flow rate actually going out of flows
      getMonthlyFlowRate(context, flowRateContract, recipient, isTopLevel),
      getClaimableBalance(context, contract, recipient),
    ])

    await context.db.Grant.update({
      id: grant.id,
      data: {
        totalEarned,
        monthlyFlowRate,
        claimableBalance,
        updatedAt: Number(event.block.timestamp),
      },
    })
  }
})
