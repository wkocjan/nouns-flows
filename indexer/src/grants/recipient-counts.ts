import { ponder } from "ponder:registry"
import { grants } from "../../ponder.schema"
import { and, eq } from "ponder"

ponder.on("RecipientCounts:block", async (params) => {
  const { event, context } = params

  const items = await context.db.sql
    .select()
    .from(grants)
    .where(and(eq(grants.isActive, true), eq(grants.isFlow, true)))
    .orderBy(grants.updatedAt)
    .limit(25)

  for (const flow of items) {
    const { recipient: contract, id } = flow

    // Get all recipients for this grant
    const recipients = await context.db.sql
      .select()
      .from(grants)
      .where(eq(grants.parentContract, contract))
      .execute()

    // Calculate counts in memory
    const activeRecipientCount = recipients.filter((r) => r.isActive && !r.isRemoved).length

    const awaitingRecipientCount = recipients.filter(
      (r) => !r.isActive && !r.isRemoved && !r.isDisputed
    ).length

    const challengedRecipientCount = recipients.filter((r) => r.isDisputed && !r.isRemoved).length

    await context.db.update(grants, { id }).set({
      updatedAt: Number(event.block.timestamp),
      activeRecipientCount,
      awaitingRecipientCount,
      challengedRecipientCount,
    })
  }
})
