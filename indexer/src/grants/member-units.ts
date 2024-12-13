import { ponder, type Context, type Event } from "ponder:registry"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"
import { grants } from "../../ponder.schema"
import { eq, or, and } from "ponder"

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

  const items = await context.db.sql
    .select()
    .from(grants)
    .where(or(eq(grants.baselinePool, pool), eq(grants.bonusPool, pool)))

  const parentGrant = items[0]

  if (!parentGrant) {
    console.error({ pool })
    throw new Error(`Parent grant not found: ${pool}`)
  }

  if (parentGrant.recipient === member.toLowerCase()) {
    // This is a flow updating it's member units on itself on initialization, skipping...
    return
  }

  const shouldUpdateBaseline = parentGrant.baselinePool === pool
  const shouldUpdateBonus = parentGrant.bonusPool === pool

  const [grant] = await context.db.sql
    .select()
    .from(grants)
    .where(
      and(
        eq(grants.recipient, member.toLowerCase()),
        eq(grants.parentContract, parentGrant.recipient)
      )
    )
    .limit(1)

  if (!grant) {
    throw new Error(`Grant not found: ${member}`)
  }

  if (shouldUpdateBaseline) {
    await context.db.update(grants, { id: grant.id }).set({
      baselineMemberUnits: newUnits.toString(),
      updatedAt: Number(event.block.timestamp),
    })
  }

  if (shouldUpdateBonus) {
    await context.db.update(grants, { id: grant.id }).set({
      bonusMemberUnits: newUnits.toString(),
      updatedAt: Number(event.block.timestamp),
    })
  }

  await handleIncomingFlowRates(context.db, parentGrant.recipient)
}
