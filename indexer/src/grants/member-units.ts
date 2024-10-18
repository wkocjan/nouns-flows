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
      superToken: token.toLowerCase(),
    },
  })

  const parentGrant = items[0]

  if (!parentGrant) {
    console.error({ pool })
    throw new Error(`Parent grant not found: ${pool}`)
  }

  const shouldUpdateBaseline = parentGrant.baselinePool === pool
  const shouldUpdateBonus = parentGrant.bonusPool === pool

  if (shouldUpdateBaseline)
    await context.db.Grant.updateMany({
      where: {
        parentContract: parentGrant.recipient,
        isFlow: true,
        recipient: member.toLowerCase(),
      },
      data: {
        baselineMemberUnits: newUnits.toString(),
        updatedAt: Number(event.block.timestamp),
      },
    })

  if (shouldUpdateBonus)
    await context.db.Grant.updateMany({
      where: {
        parentContract: parentGrant.recipient,
        isFlow: true,
        recipient: member.toLowerCase(),
      },
      data: {
        bonusMemberUnits: newUnits.toString(),
        updatedAt: Number(event.block.timestamp),
      },
    })
}
