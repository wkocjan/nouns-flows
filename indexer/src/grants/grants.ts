import { ponder, type Context, type Event } from "@/generated"
import { zeroAddress } from "viem"
import { RecipientType } from "../enums"

ponder.on("NounsFlowChildren:RecipientCreated", handleRecipientCreated)
ponder.on("NounsFlow:RecipientCreated", handleRecipientCreated)

ponder.on("NounsFlowChildren:RecipientRemoved", handleRecipientRemoved)
ponder.on("NounsFlow:RecipientRemoved", handleRecipientRemoved)

async function handleRecipientCreated(params: {
  event: Event<"NounsFlow:RecipientCreated">
  context: Context<"NounsFlow:RecipientCreated">
}) {
  const { event, context } = params
  const { Grant, Application } = context.db
  const { recipient, recipientId } = event.args

  const contract = event.log.address.toLowerCase() as `0x${string}`

  const { items } = await Application.findMany({
    where: { recipient: recipient.recipient.toLowerCase() },
  })

  const application = items?.[0]
  if (!application) throw new Error("Application not found for this grant")

  await Grant.create({
    id: `${recipientId}_${contract}`,
    data: {
      recipient: recipient.recipient.toLowerCase(),
      recipientId: recipientId.toString(),
      blockNumber: event.block.number.toString(),
      isTopLevel: false,
      isFlow: recipient.recipientType === RecipientType.FlowContract,
      isRemoved: recipient.removed,
      parent: event.transaction.to?.toLowerCase() || zeroAddress,
      votesCount: "0",
      monthlyFlowRate: "0",
      updatedAt: Number(event.block.timestamp),
      totalEarned: "0",
      claimableBalance: "0",
      arbitrator: "",
      erc20: "",
      tcr: "",
      tokenEmitter: "",
      applicationId: application.id,
      ...recipient.metadata,
    },
  })
}

async function handleRecipientRemoved(params: {
  event: Event<"NounsFlow:RecipientRemoved">
  context: Context<"NounsFlow:RecipientRemoved">
}) {
  const { event, context } = params
  const { Grant } = context.db
  const { recipientId, recipient } = event.args

  await Grant.update({
    id: `${recipientId}_${recipient}`,
    data: { isRemoved: true },
  })
}
