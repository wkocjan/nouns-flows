import { ponder, type Context, type Event } from "@/generated"
import { Party } from "../enums"

ponder.on("Arbitrator:DisputeCreated", handleDisputeCreated)
ponder.on("ArbitratorChildren:DisputeCreated", handleDisputeCreated)

ponder.on("NounsFlowTcr:Dispute", handleDispute)
ponder.on("NounsFlowTcrChildren:Dispute", handleDispute)

async function handleDisputeCreated(params: {
  event: Event<"Arbitrator:DisputeCreated">
  context: Context<"Arbitrator:DisputeCreated">
}) {
  const { event, context } = params
  const {
    arbitrable,
    id,
    revealPeriodEndTime,
    totalSupply,
    votingEndTime,
    votingStartTime,
    creationBlock,
    arbitrationCost,
  } = event.args

  const arbitrator = event.log.address.toLowerCase()
  const challenger = event.transaction.from.toLowerCase()

  await context.db.Dispute.create({
    id: `${id}_${arbitrator}`,
    data: {
      disputeId: id.toString(),
      grantId: "", // unknown now, to be updated later in the Dispute event (code below)
      evidenceGroupID: "",
      arbitrator,
      challenger,
      arbitrable: arbitrable.toString().toLowerCase(),
      votingStartTime: Number(votingStartTime),
      votingEndTime: Number(votingEndTime),
      revealPeriodEndTime: Number(revealPeriodEndTime),
      totalSupply: (totalSupply / BigInt(1e18)).toString(),
      arbitrationCost: (arbitrationCost / BigInt(1e18)).toString(),
      votes: "0",
      requesterPartyVotes: "0",
      challengerPartyVotes: "0",
      creationBlock: Number(creationBlock),
      ruling: Party.None,
      isExecuted: false,
    },
  })
}

async function handleDispute(params: {
  event: Event<"NounsFlowTcr:Dispute">
  context: Context<"NounsFlowTcr:Dispute">
}) {
  const { event, context } = params
  const { _arbitrator, _disputeID, _itemID, _evidenceGroupID } = event.args

  const disputeId = _disputeID.toString()
  const arbitrator = _arbitrator.toString().toLowerCase()

  await context.db.Grant.update({
    id: _itemID.toString(),
    data: { isDisputed: true },
  })

  const { items } = await context.db.Grant.findMany({
    where: { arbitrator, isFlow: true },
  })

  const parent = items?.[0]
  if (!parent) throw new Error("Parent grant not found")

  await context.db.Grant.update({
    id: parent.id,
    data: {
      challengedRecipientCount: parent.challengedRecipientCount + 1,
      awaitingRecipientCount: parent.awaitingRecipientCount - 1,
    },
  })

  await context.db.Dispute.updateMany({
    where: { disputeId, arbitrator },
    data: { grantId: _itemID.toString(), evidenceGroupID: _evidenceGroupID.toString() },
  })
}
