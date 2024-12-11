import { ponder } from "@/generated"
import { getTotalEarned } from "./lib/total-earned"
import { grants } from "../../ponder.schema"
import { eq } from "@ponder/core"

ponder.on("Balance:block", async (params) => {
  const { event, context } = params

  const items = await context.db.sql
    .select()
    .from(grants)
    .where(eq(grants.isActive, true))
    .orderBy(grants.updatedAt)
    .limit(15)

  for (const grant of items) {
    const { parentContract, recipient, isTopLevel, id } = grant

    const totalEarned = isTopLevel ? "0" : await getTotalEarned(context, parentContract, recipient)

    await context.db.update(grants, { id }).set({
      totalEarned,
      updatedAt: Number(event.block.timestamp),
    })
  }
})
