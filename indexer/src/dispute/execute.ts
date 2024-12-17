import { ponder, type Context, type Event } from "ponder:registry"
import { disputes } from "../../ponder.schema"

ponder.on("Arbitrator:DisputeExecuted", handleDisputeExecute)
ponder.on("ArbitratorChildren:DisputeExecuted", handleDisputeExecute)

async function handleDisputeExecute(params: {
  event: Event<"Arbitrator:DisputeExecuted">
  context: Context<"Arbitrator:DisputeExecuted">
}) {
  const { event, context } = params
  const { disputeId, ruling } = event.args

  const arbitrator = event.log.address.toLowerCase()

  await context.db.update(disputes, { id: `${disputeId}_${arbitrator}` }).set({
    ruling,
    isExecuted: true,
  })
}
