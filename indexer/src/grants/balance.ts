import { ponder } from "@/generated"
import { Status } from "../enums"
import { getClaimableBalance } from "./lib/claimable-balance"
import { getMonthlyFlowRate } from "./lib/monthly-flow"
import { getTotalEarned } from "./lib/total-earned"

ponder.on("Balance:block", async (params) => {
  const { event, context } = params

  const { items } = await context.db.Grant.findMany({
    limit: 15,
    orderBy: { updatedAt: "asc" },
    where: { isRemoved: false, status: Status.Registered },
  })

  for (const grant of items) {
    const contract = grant.isTopLevel ? grant.recipient : grant.parentContract

    const [totalEarned, monthlyFlowRate, claimableBalance] = await Promise.all([
      getTotalEarned(context, contract, grant.recipient),
      getMonthlyFlowRate(context, contract, grant.recipient, grant.isTopLevel),
      getClaimableBalance(context, contract, grant.recipient),
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
