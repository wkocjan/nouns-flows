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

  const [superToken, managerRewardSuperfluidPool] = await Promise.all([
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
      superToken: superToken.toLowerCase(),
      tcr: flowTCRProxy.toLowerCase(),
      arbitrator: arbitratorProxy.toLowerCase(),
      erc20: erc20Proxy.toLowerCase(),
      tokenEmitter: tokenEmitterProxy.toLowerCase(),
      managerRewardPool: rewardPoolProxy.toLowerCase(),
      managerRewardSuperfluidPool: managerRewardSuperfluidPool.toLowerCase(),
    },
  })
})
