import { ponder } from "@/generated"
import { getClaimableBalance } from "./lib/claimable-balance"
import { getMonthlyIncomingFlowRate } from "./lib/monthly-flow"
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

    const [totalEarned, monthlyIncomingFlowRate, claimableBalance] = await Promise.all([
      isTopLevel ? "0" : getTotalEarned(context, parentContract, recipient),
      isTopLevel ? "0" : getMonthlyIncomingFlowRate(context, parentContract, recipient),
      isFlow ? "0" : getClaimableBalance(context, parentContract, recipient),
    ])

    await context.db.Grant.update({
      id: grant.id,
      data: {
        totalEarned,
        monthlyIncomingFlowRate,
        claimableBalance,
        updatedAt: Number(event.block.timestamp),
      },
    })
  }
})
