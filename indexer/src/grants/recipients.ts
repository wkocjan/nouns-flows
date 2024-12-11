import { ponder, type Context, type Event } from "ponder:registry"
import { addGrantEmbedding, removeGrantEmbedding } from "./embeddings/embed-grants"
import { grants } from "../../ponder.schema"
import { eq, and } from "ponder"

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

  await context.db.sql
    .update(grants)
    .set({
      baselinePool: baselinePool.toLowerCase(),
      bonusPool: bonusPool.toLowerCase(),
      managerRewardPoolFlowRatePercent,
      baselinePoolFlowRatePercent,
      recipient: recipient.toLowerCase(),
      updatedAt: Number(event.block.timestamp),
      isActive: true,
    })
    .where(eq(grants.id, recipientId.toString()))

  // don't update recipient counts here because it's already done in the recipient created event
  // eg: the recipient created event is emitted when a flow recipient is created anyway
}

async function handleRecipientCreated(params: {
  event: Event<"NounsFlow:RecipientCreated">
  context: Context<"NounsFlow:RecipientCreated">
}) {
  const { event, context } = params
  const {
    recipient: { recipient, metadata, recipientType },
    recipientId,
  } = event.args

  const flowAddress = event.log.address.toLowerCase()
  const parentFlow = await getParentFlow(context.db, flowAddress)

  const [grant] = await context.db.sql
    .update(grants)
    .set({
      ...metadata,
      recipient: recipient.toLowerCase(),
      updatedAt: Number(event.block.timestamp),
      isActive: true,
    })
    .where(eq(grants.id, recipientId.toString()))
    .returning()

  if (!grant) throw new Error("Grant not found")

  await context.db.sql
    .update(grants)
    .set({
      awaitingRecipientCount: parentFlow.awaitingRecipientCount - 1,
      activeRecipientCount: parentFlow.activeRecipientCount + 1,
    })
    .where(eq(grants.id, parentFlow.id))

  await addGrantEmbedding(grant, recipientType, parentFlow.id)
}

async function handleRecipientRemoved(params: {
  event: Event<"NounsFlow:RecipientRemoved">
  context: Context<"NounsFlow:RecipientRemoved">
}) {
  const { event, context } = params
  const { recipientId } = event.args

  const flowAddress = event.log.address.toLowerCase()
  const parentFlow = await getParentFlow(context.db, flowAddress)

  const [removedGrant] = await context.db.sql
    .update(grants)
    .set({
      isRemoved: true,
      isActive: false,
      monthlyIncomingFlowRate: "0",
    })
    .where(eq(grants.id, recipientId.toString()))
    .returning()

  if (!removedGrant) throw new Error("Grant not found")

  await context.db.sql
    .update(grants)
    .set({
      activeRecipientCount: parentFlow.activeRecipientCount - 1,
    })
    .where(eq(grants.id, parentFlow.id))

  await removeGrantEmbedding(removedGrant)
}

async function getParentFlow(db: Context["db"], parentFlow: string) {
  const [flow] = await db.sql
    .select()
    .from(grants)
    .where(and(eq(grants.recipient, parentFlow), eq(grants.isFlow, true)))
    .limit(1)

  if (!flow) throw new Error("Flow not found for recipient")
  return flow
}
