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

  const { items } = await context.db.Grant.findMany({
    where: { isFlow: true, arbitrator },
  })

  const parent = items?.[0]
  if (!parent) throw new Error("Parent grant not found")

  await context.db.Grant.update({
    id: parent.id,
    data: { challengedRecipientCount: parent.challengedRecipientCount - 1 },
  })

  await context.db.Dispute.updateMany({
    where: { disputeId: disputeId.toString(), arbitrator },
    data: { ruling, isExecuted: true },
  })
}
