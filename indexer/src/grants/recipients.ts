import { ponder, type Context, type Event } from "@/generated"
import { formatEther } from "viem"
import { BASELINE_MEMBER_UNITS } from "../consts"

ponder.on("NounsFlowChildren:RecipientCreated", handleRecipientCreated)
ponder.on("NounsFlow:RecipientCreated", handleRecipientCreated)

ponder.on("NounsFlowChildren:RecipientRemoved", handleRecipientRemoved)
ponder.on("NounsFlow:RecipientRemoved", handleRecipientRemoved)

async function handleRecipientCreated(params: {
  event: Event<"NounsFlow:RecipientCreated">
  context: Context<"NounsFlow:RecipientCreated">
}) {
  const { event, context } = params
  const {
    recipient: { recipient, metadata },
    recipientId,
  } = event.args

  const parentContract = event.log.address.toLowerCase()

  await context.db.Grant.update({
    id: recipientId.toString(),
    data: {
      ...metadata,
      baselineMemberUnits: BASELINE_MEMBER_UNITS.toString(),
      bonusMemberUnits: "1",
      totalMemberUnits: (BigInt(BASELINE_MEMBER_UNITS) + BigInt(1)).toString(),
      recipient: recipient.toLowerCase(),
      updatedAt: Number(event.block.timestamp),
      isActive: true,
    },
  })

  await handleSiblings(context.db, parentContract)
}

async function handleRecipientRemoved(params: {
  event: Event<"NounsFlow:RecipientRemoved">
  context: Context<"NounsFlow:RecipientRemoved">
}) {
  const { event, context } = params
  const { recipientId } = event.args

  const parentContract = event.log.address.toLowerCase()
  await handleSiblings(context.db, parentContract)

  await context.db.Grant.update({
    id: recipientId.toString(),
    data: { isRemoved: true, isActive: false, monthlyIncomingFlowRate: "0" },
  })
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
    [0, 0]
  )

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
    const monthlyIncomingFlowRate = (totalSiblingFlowRate * secondsPerMonth).toString()

    await db.Grant.update({
      id: sibling.id,
      data: {
        monthlyIncomingFlowRate,
        totalMemberUnits: (baselineUnits + bonusUnits).toString(),
        baselineMemberUnits: sibling.baselineMemberUnits,
        bonusMemberUnits: sibling.bonusMemberUnits,
      },
    })
  }
}
