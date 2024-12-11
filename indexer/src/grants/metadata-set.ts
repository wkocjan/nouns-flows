import { ponder, type Context, type Event } from "ponder:registry"
import { grants } from "../../ponder.schema"
import { and, eq } from "ponder"

ponder.on("NounsFlow:MetadataSet", handleMetadataSet)
ponder.on("NounsFlowChildren:MetadataSet", handleMetadataSet)

async function handleMetadataSet(params: {
  event: Event<"NounsFlow:MetadataSet">
  context: Context<"NounsFlow:MetadataSet">
}) {
  const { event, context } = params
  const { metadata } = event.args
  const flow = event.log.address.toLowerCase()

  await context.db.sql
    .update(grants)
    .set({
      ...metadata,
      updatedAt: Number(event.block.timestamp),
    })
    .where(and(eq(grants.recipient, flow), eq(grants.isFlow, true)))
}
