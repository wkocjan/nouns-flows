import { ponder, type Context, type Event } from "@/generated"

ponder.on("NounsFlowTcr:Ruling", handleRuling)
ponder.on("NounsFlowTcrChildren:Ruling", handleRuling)

async function handleRuling(params: {
  event: Event<"NounsFlowTcr:Ruling">
  context: Context<"NounsFlowTcr:Ruling">
}) {
  const { event, context } = params
  const { _arbitrator, _disputeID, _ruling } = event.args

  await context.db.Dispute.updateMany({
    where: {
      disputeId: _disputeID.toString(),
      arbitrator: _arbitrator.toString().toLowerCase(),
    },
    data: { ruling: Number(_ruling) },
  })
}
