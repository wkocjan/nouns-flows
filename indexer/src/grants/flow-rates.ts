import { ponder, type Context, type Event } from "ponder:registry"
import { handleIncomingFlowRates } from "./lib/handle-incoming-flow-rates"
import { grants } from "../../ponder.schema"
import { eq, or } from "ponder"
import { and } from "ponder"

ponder.on("GdaV1:FlowDistributionUpdated", handleFlowDistributionUpdated)

async function handleFlowDistributionUpdated(params: {
  event: Event<"GdaV1:FlowDistributionUpdated">
  context: Context<"GdaV1:FlowDistributionUpdated">
}) {
  const { event, context } = params

  const { pool: rawPool, distributor, newTotalDistributionFlowRate } = event.args
  const pool = rawPool.toLowerCase()
  const recipient = distributor.toLowerCase()

  // find grant where isFlow and recipient is distributor
  const items = await context.db.sql
    .select()
    .from(grants)
    .where(
      and(
        eq(grants.isFlow, true),
        or(eq(grants.recipient, recipient), eq(grants.managerRewardPool, recipient))
      )
    )

  if (!items?.length) return

  const grant = items[0]

  if (!grant) throw new Error("Grant not found")

  const newMonthlyRate = getMonthlyFlowRate(newTotalDistributionFlowRate)

  if (pool === grant.baselinePool) {
    const monthlyOutgoingFlowRate =
      Number(grant.monthlyRewardPoolFlowRate) +
      Number(grant.monthlyBonusPoolFlowRate) +
      newMonthlyRate

    await context.db.update(grants, { id: grant.id }).set({
      monthlyBaselinePoolFlowRate: newMonthlyRate.toString(),
      monthlyOutgoingFlowRate: monthlyOutgoingFlowRate.toString(),
      updatedAt: Number(event.block.timestamp),
    })

    await handleIncomingFlowRates(context.db, recipient)
  }

  if (pool === grant.managerRewardSuperfluidPool) {
    const monthlyOutgoingFlowRate =
      Number(grant.monthlyBaselinePoolFlowRate) +
      Number(grant.monthlyBonusPoolFlowRate) +
      newMonthlyRate

    await context.db.update(grants, { id: grant.id }).set({
      monthlyRewardPoolFlowRate: newMonthlyRate.toString(),
      monthlyOutgoingFlowRate: monthlyOutgoingFlowRate.toString(),
      updatedAt: Number(event.block.timestamp),
    })
  }

  if (pool === grant.bonusPool) {
    const monthlyOutgoingFlowRate =
      Number(grant.monthlyBaselinePoolFlowRate) +
      Number(grant.monthlyRewardPoolFlowRate) +
      newMonthlyRate

    await context.db.update(grants, { id: grant.id }).set({
      monthlyBonusPoolFlowRate: newMonthlyRate.toString(),
      monthlyOutgoingFlowRate: monthlyOutgoingFlowRate.toString(),
      updatedAt: Number(event.block.timestamp),
    })

    await handleIncomingFlowRates(context.db, recipient)
  }
}

const getMonthlyFlowRate = (flowRate: bigint) => {
  return (Number(flowRate) * 60 * 60 * 24 * 30) / 1e18
}
