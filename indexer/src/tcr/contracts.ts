import { ponder } from "@/generated"
import { rewardPoolImplAbi } from "../../abis"

ponder.on("NounsFlowTcrFactory:FlowTCRDeployed", async (params) => {
  const { event, context } = params
  const { Grant } = context.db

  const {
    flowTCRProxy,
    arbitratorProxy,
    erc20Proxy,
    flowProxy,
    tokenEmitterProxy,
    rewardPoolProxy,
  } = event.args

  const [baselinePool, bonusPool, superToken, managerRewardSuperfluidPool] = await Promise.all([
    context.client.readContract({
      address: flowProxy,
      abi: context.contracts.NounsFlow.abi,
      functionName: "baselinePool",
    }),
    context.client.readContract({
      address: flowProxy,
      abi: context.contracts.NounsFlow.abi,
      functionName: "bonusPool",
    }),
    context.client.readContract({
      address: flowProxy,
      abi: context.contracts.NounsFlow.abi,
      functionName: "superToken",
    }),
    context.client.readContract({
      address: rewardPoolProxy,
      abi: rewardPoolImplAbi,
      functionName: "rewardPool",
    }),
  ])

  await Grant.updateMany({
    where: { recipient: flowProxy.toLowerCase() },
    data: {
      tcr: flowTCRProxy.toLowerCase(),
      arbitrator: arbitratorProxy.toLowerCase(),
      erc20: erc20Proxy.toLowerCase(),
      baselinePool: baselinePool.toLowerCase(),
      bonusPool: bonusPool.toLowerCase(),
      tokenEmitter: tokenEmitterProxy.toLowerCase(),
      managerRewardPool: rewardPoolProxy.toLowerCase(),
      superToken: superToken.toLowerCase(),
      managerRewardSuperfluidPool: managerRewardSuperfluidPool.toLowerCase(),
    },
  })
})
