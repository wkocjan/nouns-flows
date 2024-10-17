import { ponder, type Context, type Event } from "@/generated"
import { getMonthlyIncomingFlowRate } from "./lib/monthly-flow"
import { formatEther, getAddress } from "viem"

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

  const parentContract = event.log.address.toLowerCase()

  const incomingFlowRate = await context.client.readContract({
    address: getAddress(parentContract),
    abi: context.contracts.NounsFlow.abi,
    functionName: "getMemberTotalFlowRate",
    args: [getAddress(recipient)],
  })

  await context.db.Grant.update({
    id: recipientId.toString(),
    data: {
      ...metadata,
      monthlyIncomingFlowRate: formatEther(incomingFlowRate * BigInt(60 * 60 * 24 * 30)),
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
    data: { isRemoved: true, isActive: false, monthlyIncomingFlowRate: "0" },
  })
}
