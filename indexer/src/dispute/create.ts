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
    appealPeriodEndTime,
    arbitrable,
    id,
    revealPeriodEndTime,
    totalSupply,
    votingEndTime,
    votingStartTime,
  } = event.args

  const arbitrator = event.log.address.toLowerCase()
  const challenger = event.transaction.from.toLowerCase()

  await context.db.Dispute.create({
    id: `${id}_${arbitrator}`,
    data: {
      disputeId: id.toString(),
      itemId: "", // unknown now, to be updated later in the Dispute event
      arbitrator,
      challenger,
      arbitrable: arbitrable.toString().toLowerCase(),
      votingStartTime: Number(votingStartTime),
      votingEndTime: Number(votingEndTime),
      revealPeriodEndTime: Number(revealPeriodEndTime),
      appealPeriodEndTime: Number(appealPeriodEndTime),
      totalSupply: totalSupply.toString(),
      votes: 0,
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
  const { _arbitrator, _disputeID } = event.args

  const disputeId = _disputeID.toString()
  const arbitrator = _arbitrator.toString().toLowerCase()

  await context.db.Dispute.updateMany({
    where: { disputeId, arbitrator },
    data: {
      itemId: "TODO", // ToDo: It should come from event.args once contract is updated
    },
  })
}
