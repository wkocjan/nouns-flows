import { ponder, type Context, type Event } from "@/generated"

ponder.on("NounsFlowChildren:RecipientCreated", handleRecipientCreated)
ponder.on("NounsFlow:RecipientCreated", handleRecipientCreated)

ponder.on("NounsFlowChildren:RecipientRemoved", handleRecipientRemoved)
ponder.on("NounsFlow:RecipientRemoved", handleRecipientRemoved)

ponder.on("NounsFlowChildren:FlowRecipientCreated", handleFlowRecipientCreated)
ponder.on("NounsFlow:FlowRecipientCreated", handleFlowRecipientCreated)

async function handleFlowRecipientCreated(params: {
  event: Event<"NounsFlow:FlowRecipientCreated">
  context: Context<"NounsFlow:FlowRecipientCreated">
}) {
  const { event, context } = params
  const {
    recipient,
    recipientId,
    baselinePool,
    bonusPool,
    managerRewardPoolFlowRatePercent,
    baselinePoolFlowRatePercent,
  } = event.args

  await context.db.Grant.update({
    id: recipientId.toString(),
    data: {
      baselinePool: baselinePool.toLowerCase(),
      bonusPool: bonusPool.toLowerCase(),
      managerRewardPoolFlowRatePercent,
      baselinePoolFlowRatePercent,
      recipient: recipient.toLowerCase(),
      updatedAt: Number(event.block.timestamp),
      isActive: true,
    },
  })
}

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

  const parentContract = event.log.address.toLowerCase()

  await context.db.Grant.update({
    id: recipientId.toString(),
    data: { isRemoved: true, isActive: false, monthlyIncomingFlowRate: "0" },
  })
}
