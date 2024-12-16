import { ponder, type Context, type Event } from "ponder:registry"
import { disputes } from "../../ponder.schema"
import { and, eq } from "ponder"

ponder.on("FlowTcr:Ruling", handleRuling)
ponder.on("NounsFlowTcrChildren:Ruling", handleRuling)

async function handleRuling(params: {
  event: Event<"FlowTcr:Ruling">
  context: Context<"FlowTcr:Ruling">
}) {
  const { event, context } = params
  const { _arbitrator, _disputeID, _ruling } = event.args

  await context.db.sql
    .update(disputes)
    .set({
      ruling: Number(_ruling),
    })
    .where(
      and(
        eq(disputes.disputeId, _disputeID.toString()),
        eq(disputes.arbitrator, _arbitrator.toString().toLowerCase())
      )
    )
}
