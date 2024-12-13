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

  const [grant] = await context.db.sql
    .select()
    .from(grants)
    .where(and(eq(grants.recipient, flow), eq(grants.isFlow, true)))
    .limit(1)

  if (!grant) {
    console.error({ flow })
    throw new Error(`Grant not found: ${flow}`)
  }

  await context.db.update(grants, { id: grant.id }).set({
    ...metadata,
    updatedAt: Number(event.block.timestamp),
  })
}
