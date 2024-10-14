import { ponder, type Context, type Event } from "@/generated"

ponder.on("NounsFlowTcr:RequestEvidenceGroupID", handleRequestEvidenceGroupId)
ponder.on("NounsFlowTcrChildren:RequestEvidenceGroupID", handleRequestEvidenceGroupId)

async function handleRequestEvidenceGroupId(params: {
  event: Event<"NounsFlowTcr:RequestEvidenceGroupID">
  context: Context<"NounsFlowTcr:RequestEvidenceGroupID">
}) {
  const { event, context } = params
  const { _itemID, _evidenceGroupID } = event.args

  await context.db.Grant.update({
    id: _itemID,
    data: { evidenceGroupID: _evidenceGroupID.toString() },
  })
}
