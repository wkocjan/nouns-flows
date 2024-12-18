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

  const affectedGrantsIds = new Set([recipientId.toString()])

  let hasPreviousVotes = false

  // Mark old votes for this token as stale
  const oldVotes = await context.db.sql
    .update(votes)
    .set({ isStale: true })
    .where(
      and(
        eq(votes.contract, contract),
        eq(votes.tokenId, tokenId.toString()),
        eq(votes.isStale, false),
        not(eq(votes.blockNumber, blockNumber))
      )
    )
    .returning()

  oldVotes.forEach((vote) => {
    affectedGrantsIds.add(vote.recipientId)
    hasPreviousVotes = true
  })

  // Create the new vote
  await context.db.insert(votes).values({
    id: `${contract}_${recipientId}_${voter}_${blockNumber}_${tokenId}`,
    contract,
    recipientId: recipientId.toString(),
    tokenId: tokenId.toString(),
    bps: Number(bps),
    voter,
    blockNumber,
    blockTimestamp,
    transactionHash,
    isStale: false,
    votesCount: votesCount.toString(),
  })

  for (const affectedGrantId of affectedGrantsIds) {
    const [votesCount, monthlyIncomingFlowRate] = await Promise.all([
      getGrantVotesCount(context, affectedGrantId),
      getGrantBudget(context as Context, contract, affectedGrantId),
    ])

    await context.db.update(grants, { id: affectedGrantId }).set({
      votesCount,
      monthlyIncomingFlowRate,
    })
  }

  // if is a new voter, then we are adding new member units to the total
  // so must handle all sibling flow rates
  if (!hasPreviousVotes) {
    await handleIncomingFlowRates(context.db, contract)
  }
}

async function getGrantVotesCount(context: Context<"NounsFlow:VoteCast">, recipientId: string) {
  const result = await context.db.sql
    .select()
    .from(votes)
    .where(and(eq(votes.recipientId, recipientId), eq(votes.isStale, false)))

  return result.reduce((acc: bigint, v) => acc + BigInt(v.votesCount), BigInt(0)).toString()
}

async function getGrantBudget(context: Context, parentContract: `0x${string}`, id: string) {
  const grant = await context.db.find(grants, { id })

  if (!grant) throw new Error(`Could not find grant ${id}`)

  return getMonthlyIncomingFlowRate(context, parentContract, grant.recipient)
}
