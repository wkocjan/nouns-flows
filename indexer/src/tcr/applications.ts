import { ponder, type Context, type Event } from "@/generated"
import { decodeAbiParameters } from "viem"
import { RecipientType } from "../enums"

ponder.on("NounsFlowTcr:ItemSubmitted", handleItemSubmitted)
ponder.on("NounsFlowTcrChildren:ItemSubmitted", handleItemSubmitted)

async function handleItemSubmitted(params: {
  event: Event<"NounsFlowTcr:ItemSubmitted">
  context: Context<"NounsFlowTcr:ItemSubmitted">
}) {
  const { event, context } = params
  const { _submitter, _data, _itemID, _evidenceGroupID } = event.args

  const { items } = await context.db.Grant.findMany({
    where: { tcr: event.log.address.toLowerCase() },
  })

  const flow = items?.[0]
  if (!flow) throw new Error("Flow not found for TCR item")

  const [recipient, metadata, recipientType] = decodeAbiParameters(
    [
      { name: "recipient", type: "address" },
      {
        name: "metadata",
        type: "tuple",
        components: [
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "image", type: "string" },
          { name: "tagline", type: "string" },
          { name: "url", type: "string" },
        ],
      },
      { name: "recipientType", type: "uint8" },
    ],
    _data
  )

  await context.db.Application.create({
    id: _itemID,
    data: {
      flowId: flow.id,
      submitter: _submitter.toLowerCase(),
      recipient: recipient.toString(),
      status: 0,
      blockNumber: event.block.number.toString(),
      isFlow: recipientType === RecipientType.FlowContract,
      updatedAt: Number(event.block.timestamp),
      evidenceGroupID: _evidenceGroupID.toString(),
      isDisputed: false,
      isResolved: false,
      ...metadata,
    },
  })
}
