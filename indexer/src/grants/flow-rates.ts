import { ponder, type Context, type Event } from "@/generated"
import { formatEther } from "viem"

ponder.on("NounsFlowChildren:FlowRateUpdated", handleFlowRateUpdated)
ponder.on("NounsFlow:FlowRateUpdated", handleFlowRateUpdated)

async function handleFlowRateUpdated(params: {
  event: Event<"NounsFlow:FlowRateUpdated">
  context: Context<"NounsFlow:FlowRateUpdated">
}) {
  const { event, context } = params
  const { newTotalFlowRate, baselinePoolFlowRate, bonusPoolFlowRate, managerRewardFlowRate } =
    event.args
  const recipient = event.log.address.toLowerCase()

  await context.db.Grant.updateMany({
    where: { recipient, isFlow: true },
    data: {
      monthlyOutgoingFlowRate: formatEther(newTotalFlowRate * BigInt(60 * 60 * 24 * 30)),
      monthlyRewardPoolFlowRate: formatEther(managerRewardFlowRate * BigInt(60 * 60 * 24 * 30)),
      monthlyBaselinePoolFlowRate: formatEther(baselinePoolFlowRate * BigInt(60 * 60 * 24 * 30)),
      monthlyBonusPoolFlowRate: formatEther(bonusPoolFlowRate * BigInt(60 * 60 * 24 * 30)),
      updatedAt: Number(event.block.timestamp),
    },
  })
}
