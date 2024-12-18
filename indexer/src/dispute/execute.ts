import { ponder, type Context, type Event } from "ponder:registry"
import { disputes, grants } from "../../ponder.schema"
import { and, eq } from "ponder"

ponder.on("Arbitrator:DisputeExecuted", handleDisputeExecute)
ponder.on("ArbitratorChildren:DisputeExecuted", handleDisputeExecute)

async function handleDisputeExecute(params: {
  event: Event<"Arbitrator:DisputeExecuted">
  context: Context<"Arbitrator:DisputeExecuted">
}) {
  const { event, context } = params
  const { disputeId, ruling } = event.args

  const arbitrator = event.log.address.toLowerCase()

  const items = await context.db.sql
    .select()
    .from(grants)
    .where(and(eq(grants.arbitrator, arbitrator), eq(grants.isFlow, true)))

  const parent = items[0]
  if (!parent) throw new Error("Parent grant not found")

  await context.db.update(grants, { id: parent.id }).set((row) => ({
    challengedRecipientCount: row.challengedRecipientCount - 1,
  }))

  await context.db.update(disputes, { id: `${disputeId}_${arbitrator}` }).set({
    ruling,
    isExecuted: true,
  })
}
