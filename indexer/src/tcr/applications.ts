import { ponder, type Context, type Event } from "@/generated"
import { decodeAbiParameters, decodeEventLog, parseAbiParameters } from "viem"

ponder.on("NounsFlowTcr:ItemSubmitted", handleItemSubmitted)
ponder.on("NounsFlowTcrChildren:ItemSubmitted", handleItemSubmitted)

async function handleItemSubmitted(params: {
  event: Event<"NounsFlowTcr:ItemSubmitted">
  context: Context<"NounsFlowTcr:ItemSubmitted">
}) {
  const { event, context } = params
  const { _submitter, _data, _itemID } = event.args

  const contract = event.log.address.toLowerCase() as `0x${string}`

  const { items } = await context.db.Grant.findMany({ where: { tcr: contract } })

  const flow = items?.[0]
  if (!flow) throw new Error("Parent flow not found for TCR item")

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
      isFlow: recipientType === 1,
      updatedAt: Number(event.block.timestamp),
      ...metadata,
    },
  })
}
