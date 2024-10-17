import { ponder, type Context, type Event } from "@/generated"
import { getMonthlyIncomingFlowRate } from "./lib/monthly-flow"
import { BASELINE_MEMBER_UNITS } from "../consts"

ponder.on("NounsFlow:VoteCast", handleVoteCast)
ponder.on("NounsFlowChildren:VoteCast", handleVoteCast)

async function handleVoteCast(params: {
  event: Event<"NounsFlow:VoteCast">
  context: Context<"NounsFlow:VoteCast">
}) {
  const { event, context } = params
  const { recipientId, tokenId, bps, totalWeight, memberUnits: bonusMemberUnits } = event.args

  const blockNumber = event.block.number.toString()
  const voter = event.transaction.from.toLowerCase()
  const contract = event.log.address.toLowerCase() as `0x${string}`
  const votesCount = bps / (totalWeight / BigInt(1e18))

  const affectedGrantsIds = new Set([recipientId.toString()])

  // Mark old votes for this token as stale
  ;(
    await context.db.Vote.updateMany({
      where: {
        contract,
        tokenId: tokenId.toString(),
        isStale: false,
        blockNumber: { not: blockNumber },
      },
      data: { isStale: true },
    })
  ).forEach((vote) => affectedGrantsIds.add(vote.recipientId))

  // Create the new vote
  await context.db.Vote.create({
    id: `${contract}_${recipientId}_${voter}_${blockNumber}_${tokenId}`,
    data: {
      contract,
      recipientId: recipientId.toString(),
      tokenId: tokenId.toString(),
      bps: Number(bps),
      voter,
      blockNumber,
      isStale: false,
      votesCount: votesCount.toString(),
    },
  })

  for (const affectedGrantId of affectedGrantsIds) {
    const [votesCount, monthlyIncomingFlowRate] = await Promise.all([
      getGrantVotesCount(context, affectedGrantId),
      getGrantBudget(context as Context, contract, affectedGrantId),
    ])

    await context.db.Grant.update({
      id: affectedGrantId,
      data: {
        votesCount,
        monthlyIncomingFlowRate,
        totalMemberUnits: (BigInt(BASELINE_MEMBER_UNITS) + BigInt(bonusMemberUnits)).toString(),
        bonusMemberUnits: bonusMemberUnits.toString(),
      },
    })
  }
}

async function getGrantVotesCount(context: Context<"NounsFlow:VoteCast">, recipientId: string) {
  const votes = await context.db.Vote.findMany({ where: { recipientId, isStale: false } })
  return votes.items.reduce((acc, v) => acc + BigInt(v.votesCount), BigInt(0)).toString()
}

async function getGrantBudget(context: Context, parentContract: `0x${string}`, id: string) {
  const grant = await context.db.Grant.findUnique({ id })
  if (!grant) throw new Error(`Could not find grant ${id}`)

  return getMonthlyIncomingFlowRate(context, parentContract, grant.recipient)
}
