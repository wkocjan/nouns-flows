import { ponder, type Context, type Event } from "@/generated"

ponder.on("NounsFlowChildren:RecipientCreated", handleRecipientCreated)
ponder.on("NounsFlow:RecipientCreated", handleRecipientCreated)

ponder.on("NounsFlowChildren:RecipientRemoved", handleRecipientRemoved)
ponder.on("NounsFlow:RecipientRemoved", handleRecipientRemoved)

async function handleRecipientCreated(params: {
  event: Event<"NounsFlow:RecipientCreated">
  context: Context<"NounsFlow:RecipientCreated">
}) {
  const { event, context } = params
  const {
    recipient: { recipient, metadata },
    recipientId,
  } = event.args

  await context.db.Grant.update({
    id: recipientId.toString(),
    data: {
      ...metadata,
      recipient: recipient.toLowerCase(),
      updatedAt: Number(event.block.timestamp),
      isActive: true,
    },
  })
}

async function handleRecipientRemoved(params: {
  event: Event<"NounsFlow:RecipientRemoved">
  context: Context<"NounsFlow:RecipientRemoved">
}) {
  const { event, context } = params
  const { recipientId } = event.args

  await context.db.Grant.update({
    id: recipientId.toString(),
    data: { isRemoved: true, isActive: false },
  })
}
