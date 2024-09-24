import { ponder, type Context, type Event } from "@/generated"
import { getMonthlyFlowRate } from "./lib/monthly-flow"

ponder.on("NounsFlow:VoteCast", handleVoteCast)
ponder.on("NounsFlowChildren:VoteCast", handleVoteCast)

async function handleVoteCast(params: {
  event: Event<"NounsFlow:VoteCast">
  context: Context<"NounsFlow:VoteCast">
}) {
  const { event, context } = params
  const { recipientId, tokenId, bps, totalWeight } = event.args

  const blockNumber = event.block.number.toString()
  const voter = event.transaction.from.toLowerCase()
  const contract = event.log.address.toLowerCase() as `0x${string}`
  const votesCount = bps / (totalWeight / BigInt(1e18))

  const affectedRecipientIds = new Set([recipientId.toString()])

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
  ).forEach((r) => affectedRecipientIds.add(r.recipientId))

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

  for (const affectedRecipientId of affectedRecipientIds) {
    const [votesCount, monthlyFlowRate] = await Promise.all([
      getGrantVotesCount(context, contract, affectedRecipientId),
      getGrantBudget(context as Context, contract, affectedRecipientId),
    ])

    await context.db.Grant.update({
      id: `${affectedRecipientId}_${contract}`,
      data: { votesCount, monthlyFlowRate },
    })
  }
}

async function getGrantVotesCount(
  context: Context<"NounsFlow:VoteCast">,
  contract: `0x${string}`,
  recipientId: string
) {
  const votes = await context.db.Vote.findMany({
    where: { contract, recipientId, isStale: false },
  })

  return votes.items.reduce((acc, v) => acc + BigInt(v.votesCount), BigInt(0)).toString()
}

async function getGrantBudget(context: Context, contract: `0x${string}`, recipientId: string) {
  const grant = await context.db.Grant.findUnique({
    id: `${recipientId}_${contract}`,
  })

  if (!grant) {
    throw new Error(`Could not find recipient ${recipientId} on ${contract}`)
  }

  return getMonthlyFlowRate(context, contract, grant.recipient, grant.isTopLevel)
}
