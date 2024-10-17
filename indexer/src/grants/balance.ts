import { ponder } from "@/generated"
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
    const { parentContract, recipient, isTopLevel } = grant

    const [totalEarned, monthlyIncomingFlowRate] = await Promise.all([
      isTopLevel ? "0" : getTotalEarned(context, parentContract, recipient),
      isTopLevel ? "0" : getMonthlyIncomingFlowRate(context, parentContract, recipient),
    ])

    await context.db.Grant.update({
      id: grant.id,
      data: {
        totalEarned,
        monthlyIncomingFlowRate,
        updatedAt: Number(event.block.timestamp),
      },
    })
  }
})
