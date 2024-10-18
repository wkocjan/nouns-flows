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
  const { newUnits, member } = event.args
  const pool = event.log.address.toLowerCase()

  const { items } = await context.db.Grant.findMany({
    where: {
      OR: [{ baselinePool: pool }, { bonusPool: pool }],
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
        recipient: member.toLowerCase(),
      },
      data: {
        bonusMemberUnits: newUnits.toString(),
        updatedAt: Number(event.block.timestamp),
      },
    })

  await handleSiblings(context.db, parentGrant.recipient)
}

async function handleSiblings(db: Context["db"], parentContract: string) {
  const { items } = await db.Grant.findMany({
    where: { parentContract, isActive: true, isRemoved: false },
  })
  const { items: parents } = await db.Grant.findMany({
    where: { recipient: parentContract },
  })
  const parent = parents?.[0]

  if (!parent) throw new Error(`Parent not found: ${parentContract}`)

  if (!items?.length) return

  const secondsPerMonth = 60 * 60 * 24 * 30
  const baselineFlowRate = Number(parent.monthlyBaselinePoolFlowRate) / secondsPerMonth
  const bonusFlowRate = Number(parent.monthlyBonusPoolFlowRate) / secondsPerMonth

  // Calculate total baseline and bonus member units across all siblings
  const [totalBaselineMemberUnits, totalBonusMemberUnits] = items.reduce(
    ([baselineSum, bonusSum], item) => [
      baselineSum + Number(item.baselineMemberUnits),
      bonusSum + Number(item.bonusMemberUnits),
    ],
    [1, 1] // the parent always has 1 unit directing the pool flow to itself
  )

  if (totalBaselineMemberUnits === 0 || totalBonusMemberUnits === 0) {
    console.error({
      totalBaselineMemberUnits,
      totalBonusMemberUnits,
      baselineFlowRate,
      bonusFlowRate,
    })
    throw new Error("Invalid member units")
  }

  // Calculate flow rate per unit for baseline and bonus pools
  const baselineFlowRatePerUnit = baselineFlowRate / totalBaselineMemberUnits
  const bonusFlowRatePerUnit = bonusFlowRate / totalBonusMemberUnits

  for (const sibling of items) {
    const baselineUnits = Number(sibling.baselineMemberUnits)
    const bonusUnits = Number(sibling.bonusMemberUnits)

    const baselineFlowRate = baselineFlowRatePerUnit * baselineUnits
    const bonusFlowRate = bonusFlowRatePerUnit * bonusUnits
    const totalSiblingFlowRate = baselineFlowRate + bonusFlowRate

    // Convert flow rate to monthly amount
    const monthlyIncomingFlowRate = totalSiblingFlowRate * secondsPerMonth

    if (isNaN(monthlyIncomingFlowRate)) {
      console.error(totalSiblingFlowRate, baselineFlowRate, bonusFlowRate)
      throw new Error(`Invalid monthly incoming flow rate: ${monthlyIncomingFlowRate}`)
    }

    await db.Grant.update({
      id: sibling.id,
      data: {
        monthlyIncomingFlowRate: monthlyIncomingFlowRate.toString(),
      },
    })
  }
}
