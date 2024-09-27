import { ponder, type Context, type Event } from "@/generated"
import { getAddress, zeroAddress } from "viem"
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
  const { Grant } = context.db
  const {
    recipient: { recipient, metadata },
    recipientId,
  } = event.args

  const contract = event.log.address.toLowerCase() as `0x${string}`

  const { items } = await Grant.findMany({ where: { recipient: contract, isFlow: true } })
  const flow = items?.[0]
  if (!flow) throw new Error("Parent flow not found for this recipient")

  // TODO - Uncomment when contract is updated
  // const id = await context.client.readContract({
  //   address: getAddress(flow.tcr),
  //   abi: context.contracts.NounsFlowTcr.abi,
  //   functionName: "FlowRecipientIDtoItemID",
  //   args: [recipientId],
  // })

  // await Grant.update({
  //   id,
  //   data: {
  //     ...metadata,
  //     recipient: recipient.toLowerCase(),
  //     recipientId: recipientId.toString(),
  //     updatedAt: Number(event.block.timestamp),
  //     isActive: true,
  //   },
  // })
}

async function handleRecipientRemoved(params: {
  event: Event<"NounsFlow:RecipientRemoved">
  context: Context<"NounsFlow:RecipientRemoved">
}) {
  const { event, context } = params
  const { recipientId, recipient } = event.args

  await context.db.Grant.updateMany({
    where: {
      recipientId: recipientId.toString(),
      recipient: recipient.toLowerCase(),
      parentContract: event.log.address.toLowerCase(),
    },
    data: { isRemoved: true, isActive: false },
  })
}
