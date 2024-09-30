import { ponder, type Context, type Event } from "@/generated"

ponder.on("Arbitrator:DisputeExecuted", handleDisputeExecute)
ponder.on("ArbitratorChildren:DisputeExecuted", handleDisputeExecute)

async function handleDisputeExecute(params: {
  event: Event<"Arbitrator:DisputeExecuted">
  context: Context<"Arbitrator:DisputeExecuted">
}) {
  const { event, context } = params
  const { disputeId, ruling } = event.args

  const arbitrator = event.log.address.toLowerCase()

  await context.db.Dispute.updateMany({
    where: { disputeId: disputeId.toString(), arbitrator },
    data: { ruling, isExecuted: true },
  })
}
