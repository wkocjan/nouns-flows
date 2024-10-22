import { type Context } from "@/generated"

export async function handleIncomingFlowRates(db: Context["db"], parentContract: string) {
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
