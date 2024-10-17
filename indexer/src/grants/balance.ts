import { ponder } from "@/generated"
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

    const totalEarned = isTopLevel ? "0" : await getTotalEarned(context, parentContract, recipient)

    await context.db.Grant.update({
      id: grant.id,
      data: {
        totalEarned,
        updatedAt: Number(event.block.timestamp),
      },
    })
  }
})
