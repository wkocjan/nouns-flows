import { ponder, Schema, type Context, type Event } from "@/generated"
import { postToEmbeddingsQueueRequest } from "../queue/client"
import { JobBody } from "../queue/job"
import { RecipientType } from "../enums"
import { getNonzeroLowercasedAddresses } from "../queue/helpers"

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

  const grant = await context.db.Grant.update({
    id: recipientId.toString(),
    data: {
      ...metadata,
      recipient: recipient.toLowerCase(),
      updatedAt: Number(event.block.timestamp),
      isActive: true,
    },
  })

  await context.db.Grant.update({
    id: parentFlow.id,
    data: {
      awaitingRecipientCount: parentFlow.awaitingRecipientCount - 1,
      activeRecipientCount: parentFlow.activeRecipientCount + 1,
    },
  })

  await embed(grant, recipientType)
}

async function handleRecipientRemoved(params: {
  event: Event<"NounsFlow:RecipientRemoved">
  context: Context<"NounsFlow:RecipientRemoved">
}) {
  const { event, context } = params
  const { recipientId } = event.args

  const flowAddress = event.log.address.toLowerCase()
  const parentFlow = await getParentFlow(context.db, flowAddress)

  await context.db.Grant.update({
    id: recipientId.toString(),
    data: { isRemoved: true, isActive: false, monthlyIncomingFlowRate: "0" },
  })

  await context.db.Grant.update({
    id: parentFlow.id,
    data: { activeRecipientCount: parentFlow.activeRecipientCount - 1 },
  })
}

async function getParentFlow(db: Context["db"], parentFlow: string) {
  const { items } = await db.Grant.findMany({
    where: { recipient: parentFlow, isFlow: true },
  })
  const flow = items?.[0]
  if (!flow) throw new Error("Flow not found for recipient")
  return flow
}

async function embed(grant: Schema["Grant"], recipientType: RecipientType) {
  if (recipientType === RecipientType.ExternalAccount) {
    return embedGrant(grant)
  }
  if (recipientType === RecipientType.FlowContract) {
    return embedFlowContract(grant)
  }

  throw new Error("Invalid recipient type")
}

async function embedGrant(grant: Schema["Grant"]) {
  const users = getNonzeroLowercasedAddresses([grant.recipient, grant.submitter])

  const content = `This is an approved grant submitted by ${grant.submitter} for ${
    grant.recipient
  }. Here is the grant data: ${JSON.stringify(grant)}`

  const payload: JobBody = {
    type: "grant",
    content,
    groups: ["nouns"],
    users,
    tags: ["flows"],
  }

  await postToEmbeddingsQueueRequest(payload)
}

async function embedFlowContract(grant: Schema["Grant"]) {
  const users = getNonzeroLowercasedAddresses([grant.recipient, grant.submitter])

  const content = `This is a flow contract budget that people can apply for. Here is the flow data: ${JSON.stringify(
    grant
  )}`

  const payload: JobBody = {
    type: "flow",
    content,
    groups: ["nouns"],
    users,
    tags: ["flows"],
  }

  await postToEmbeddingsQueueRequest(payload)
}
