import { ponder, type Context, type Event } from "@/generated"
import { grants } from "../../ponder.schema"

ponder.on("NounsFlowTcr:RequestEvidenceGroupID", handleRequestEvidenceGroupId)
ponder.on("NounsFlowTcrChildren:RequestEvidenceGroupID", handleRequestEvidenceGroupId)

async function handleRequestEvidenceGroupId(params: {
  event: Event<"NounsFlowTcr:RequestEvidenceGroupID">
  context: Context<"NounsFlowTcr:RequestEvidenceGroupID">
}) {
  const { event, context } = params
  const { _itemID, _evidenceGroupID } = event.args

  await context.db.update(grants, { id: _itemID }).set({
    evidenceGroupID: _evidenceGroupID.toString(),
  })
}
