import { ponder, type Context, type Event } from "@/generated"

ponder.on("BonusPool:MemberUnitsUpdated", handleMemberUnitsUpdated)
ponder.on("BaselinePool:MemberUnitsUpdated", handleMemberUnitsUpdated)
ponder.on("BaselinePoolChildren:MemberUnitsUpdated", handleMemberUnitsUpdated)
ponder.on("BonusPoolChildren:MemberUnitsUpdated", handleMemberUnitsUpdated)

async function handleMemberUnitsUpdated(params: {
  event: Event<"BonusPool:MemberUnitsUpdated">
  context: Context<"BonusPool:MemberUnitsUpdated">
}) {
  const { event, context } = params
  const { newUnits, member, token } = event.args
  const pool = event.log.address.toLowerCase()

  const { items } = await context.db.Grant.findMany({
    where: {
      OR: [{ baselinePool: pool }, { bonusPool: pool }],
      isFlow: false,
      superToken: token.toLowerCase(),
    },
  })

  const parentGrant = items[0]

  if (!parentGrant) {
    return
  }

  const shouldUpdateBaseline = parentGrant.baselinePool === pool
  const shouldUpdateBonus = parentGrant.bonusPool === pool

  await context.db.Grant.updateMany({
    where: { parentContract: parentGrant.recipient, isFlow: true, recipient: member.toLowerCase() },
    data: {
      baselineMemberUnits: shouldUpdateBaseline ? newUnits.toString() : undefined,
      bonusMemberUnits: shouldUpdateBonus ? newUnits.toString() : undefined,
      updatedAt: Number(event.block.timestamp),
    },
  })
}
