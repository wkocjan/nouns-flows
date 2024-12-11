import { ponder, type Context, type Event } from "@/generated"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"
import { grants } from "../../ponder.schema"
import { eq, or, and } from "@ponder/core"

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

  const shouldUpdateBaseline = parentGrant.baselinePool === pool
  const shouldUpdateBonus = parentGrant.bonusPool === pool

  if (shouldUpdateBaseline) {
    await context.db.sql
      .update(grants)
      .set({
        baselineMemberUnits: newUnits.toString(),
        updatedAt: Number(event.block.timestamp),
      })
      .where(
        and(
          eq(grants.parentContract, parentGrant.recipient),
          eq(grants.recipient, member.toLowerCase())
        )
      )
  }

  if (shouldUpdateBonus) {
    await context.db.sql
      .update(grants)
      .set({
        bonusMemberUnits: newUnits.toString(),
        updatedAt: Number(event.block.timestamp),
      })
      .where(
        and(
          eq(grants.parentContract, parentGrant.recipient),
          eq(grants.recipient, member.toLowerCase())
        )
      )
  }

  await handleIncomingFlowRates(context.db, parentGrant.recipient)
}
