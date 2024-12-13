import { ponder, type Context, type Event } from "ponder:registry"
import { getMonthlyIncomingFlowRate } from "./lib/monthly-flow"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"
import { votes, grants } from "ponder:schema"
import { eq, not } from "ponder"
import { and } from "ponder"

ponder.on("NounsFlow:VoteCast", handleVoteCast)
ponder.on("NounsFlowChildren:VoteCast", handleVoteCast)

async function handleVoteCast(params: {
  event: Event<"NounsFlow:VoteCast">
  context: Context<"NounsFlow:VoteCast">
}) {
  const { event, context } = params
  const { recipientId, tokenId, bps, totalWeight } = event.args

  const blockNumber = event.block.number.toString()
  const blockTimestamp = Number(event.block.timestamp)
  const transactionHash = event.transaction.hash
  const voter = event.transaction.from.toLowerCase()
  const contract = event.log.address.toLowerCase() as `0x${string}`
  const votesCount = bps / (totalWeight / BigInt(1e18))

  const affectedGrantsIds = new Map<string, bigint>()
  affectedGrantsIds.set(recipientId.toString(), votesCount)

  let hasPreviousVotes = false

  // Mark old votes for this token as stale
  const oldVote = await context.db.find(votes, { id: getVoteId(contract, tokenId) })

  if (oldVote) {
    affectedGrantsIds.set(oldVote.recipientId, -BigInt(oldVote.votesCount))
    hasPreviousVotes = true
  }

  // remove old vote
  await context.db.delete(votes, {
    id: getVoteId(contract, tokenId),
  })

  // Create the new vote
  await context.db.insert(votes).values({
    id: getVoteId(contract, tokenId),
    contract,
    recipientId: recipientId.toString(),
    tokenId: tokenId.toString(),
    bps: Number(bps),
    voter,
    blockNumber,
    blockTimestamp,
    transactionHash,
    votesCount: votesCount.toString(),
  })

  for (const [affectedGrantId, votesDelta] of affectedGrantsIds) {
    const monthlyIncomingFlowRate = await getGrantBudget(
      context as Context,
      contract,
      affectedGrantId
    )

    await context.db.update(grants, { id: affectedGrantId }).set((row) => ({
      votesCount: (BigInt(row.votesCount) + votesDelta).toString(),
      monthlyIncomingFlowRate,
    }))
  }

  // if is a new voter, then we are adding new member units to the total
  // so must handle all sibling flow rates
  if (!hasPreviousVotes) {
    await handleIncomingFlowRates(context.db, contract)
  }
}

function getVoteId(contract: `0x${string}`, tokenId: bigint) {
  return `${contract}_${tokenId.toString()}`
}

async function getGrantBudget(context: Context, parentContract: `0x${string}`, id: string) {
  const grant = await context.db.find(grants, { id })

  if (!grant) throw new Error(`Could not find grant ${id}`)

  return getMonthlyIncomingFlowRate(context, parentContract, grant.recipient)
}
