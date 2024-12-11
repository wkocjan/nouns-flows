import { ponder, type Context, type Event } from "ponder:registry"
import { Party } from "../enums"
import { disputes, disputeVotes } from "../../ponder.schema"
import { eq, and } from "ponder"

ponder.on("Arbitrator:VoteCommitted", handleVoteCommitted)
ponder.on("ArbitratorChildren:VoteCommitted", handleVoteCommitted)

ponder.on("Arbitrator:VoteRevealed", handleVoteRevealed)
ponder.on("ArbitratorChildren:VoteRevealed", handleVoteRevealed)

async function handleVoteCommitted(params: {
  event: Event<"Arbitrator:VoteCommitted">
  context: Context<"Arbitrator:VoteCommitted">
}) {
  const { event, context } = params
  const { disputeId, commitHash } = event.args

  const arbitrator = event.log.address.toLowerCase()
  const voter = event.transaction.from.toLowerCase()

  await context.db.insert(disputeVotes).values({
    id: `${disputeId}_${arbitrator}_${voter}`,
    disputeId: disputeId.toString(),
    committedAt: Number(event.block.timestamp),
    commitHash,
    arbitrator,
    voter,
  })
}

async function handleVoteRevealed(params: {
  event: Event<"Arbitrator:VoteRevealed">
  context: Context<"Arbitrator:VoteRevealed">
}) {
  const { event, context } = params
  const { disputeId, commitHash, reason, voter } = event.args

  const votes = event.args.votes / BigInt(1e18)
  const choice = Number(event.args.choice)

  const arbitrator = event.log.address.toLowerCase()
  const revealedBy = event.transaction.from.toLowerCase()

  const [dispute] = await context.db.sql
    .select()
    .from(disputes)
    .where(and(eq(disputes.disputeId, disputeId.toString()), eq(disputes.arbitrator, arbitrator)))
    .limit(1)

  if (!dispute) throw new Error("Dispute not found")

  // Update vote
  await context.db.sql
    .update(disputeVotes)
    .set({
      choice,
      votes: votes.toString(),
      reason: reason,
      revealedAt: Number(event.block.timestamp),
      revealedBy: revealedBy.toLowerCase(),
    })
    .where(
      and(
        eq(disputeVotes.disputeId, disputeId.toString()),
        eq(disputeVotes.arbitrator, arbitrator.toLowerCase()),
        eq(disputeVotes.voter, voter.toLowerCase()),
        eq(disputeVotes.commitHash, commitHash)
      )
    )

  // Update dispute
  const partyVotes = choice === Party.Requester ? "requesterPartyVotes" : "challengerPartyVotes"

  await context.db.sql
    .update(disputes)
    .set({
      votes: (BigInt(dispute.votes) + votes).toString(),
      [partyVotes]: (BigInt(dispute[partyVotes]) + votes).toString(),
    })
    .where(eq(disputes.id, dispute.id))
}
