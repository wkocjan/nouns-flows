import { ponder, type Context, type Event } from "@/generated"

ponder.on("NounsFlow:MetadataSet", handleMetadataSet)
ponder.on("NounsFlowChildren:MetadataSet", handleMetadataSet)

async function handleMetadataSet(params: {
  event: Event<"NounsFlow:MetadataSet">
  context: Context<"NounsFlow:MetadataSet">
}) {
  const { event, context } = params
  const { metadata } = event.args
  const flow = event.log.address.toLowerCase()

  await context.db.Grant.updateMany({
    where: {
      recipient: flow,
      isFlow: true,
    },
    data: { ...metadata, updatedAt: Number(event.block.timestamp) },
  })
}
