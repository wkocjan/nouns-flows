import { ponder, type Context, type Event } from "@/generated"
import { decodeAbiParameters, getAddress } from "viem"
import { RecipientType, Status } from "../enums"

ponder.on("NounsFlowTcr:ItemSubmitted", handleItemSubmitted)
ponder.on("NounsFlowTcrChildren:ItemSubmitted", handleItemSubmitted)

async function handleItemSubmitted(params: {
  event: Event<"NounsFlowTcr:ItemSubmitted">
  context: Context<"NounsFlowTcr:ItemSubmitted">
}) {
  const { event, context } = params
  const { _submitter, _data, _itemID, _evidenceGroupID } = event.args

  const tcr = event.log.address.toLowerCase()

  const { items } = await context.db.Grant.findMany({ where: { tcr, isFlow: true } })
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

  const challengePeriodDuration = await context.client.readContract({
    address: getAddress(tcr),
    abi: context.contracts.NounsFlowTcr.abi,
    functionName: "challengePeriodDuration",
  })

  await context.db.Grant.create({
    id: _itemID,
    data: {
      ...metadata,
      isActive: false,
      recipient: recipient.toString(),
      recipientId: "",
      flowId: flow.id,
      submitter: _submitter.toLowerCase(),
      parentContract: flow.recipient,
      isTopLevel: false,
      isFlow: recipientType === RecipientType.FlowContract,
      isRemoved: false,
      votesCount: "0",
      monthlyFlowRate: "0",
      totalEarned: "0",
      claimableBalance: "0",
      tcr: "",
      erc20: "",
      arbitrator: "",
      tokenEmitter: "",
      status: Status.RegistrationRequested,
      challengePeriodEndsAt: Number(event.block.timestamp + challengePeriodDuration),
      isDisputed: false,
      evidenceGroupID: _evidenceGroupID.toString(),
      createdAt: Number(event.block.timestamp),
      updatedAt: Number(event.block.timestamp),
    },
  })
}
