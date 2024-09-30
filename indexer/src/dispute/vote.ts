import { ponder, type Context, type Event } from "@/generated"

ponder.on("Arbitrator:VoteCommitted", handleVoteCommitted)
ponder.on("ArbitratorChildren:VoteCommitted", handleVoteCommitted)

ponder.on("Arbitrator:VoteRevealed", handleVoteRevealed)
ponder.on("ArbitratorChildren:VoteRevealed", handleVoteRevealed)

async function handleVoteCommitted(params: {
  event: Event<"Arbitrator:VoteCommitted">
  context: Context<"Arbitrator:VoteCommitted">
}) {
  const { event, context } = params
  const { disputeId, secretHash } = event.args

  const arbitrator = event.log.address.toLowerCase()
  const voter = event.transaction.from.toLowerCase()

  await context.db.DisputeVote.create({
    id: `${disputeId}_${arbitrator}_${voter}`,
    data: {
      disputeId: disputeId.toString(),
      secretHash,
      arbitrator,
      voter,
    },
  })
}

async function handleVoteRevealed(params: {
  event: Event<"Arbitrator:VoteRevealed">
  context: Context<"Arbitrator:VoteRevealed">
}) {
  const { event, context } = params
  const { disputeId, choice, votes, secretHash, reason } = event.args

  const arbitrator = event.log.address.toLowerCase()
  const voter = event.transaction.from.toLowerCase()

  const { items } = await context.db.Dispute.findMany({ where: { disputeId: disputeId.toString(), arbitrator } })
  const dispute = items?.[0]
  if (!dispute) throw new Error("Dispute not found")

  await context.db.DisputeVote.updateMany({
    where: { disputeId: disputeId.toString(), arbitrator, voter, secretHash },
    data: {
      choice: Number(choice),
      votes: votes.toString(),
      reason: reason,
    },
  })

  await context.db.Dispute.updateMany({
    where: { disputeId: disputeId.toString(), arbitrator },
    data: {
      votes: (BigInt(dispute.votes) + votes).toString(),
    },
  })
}
