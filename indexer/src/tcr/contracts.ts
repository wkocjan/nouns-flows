import { ponder } from "ponder:registry"
import { rewardPoolImplAbi } from "../../abis"
import { grants } from "../../ponder.schema"
import { eq } from "ponder"

ponder.on("NounsFlowTcrFactory:FlowTCRDeployed", async (params) => {
  const { event, context } = params

  const {
    flowTCRProxy,
    arbitratorProxy,
    erc20Proxy,
    flowProxy,
    tokenEmitterProxy,
    rewardPoolProxy,
  } = event.args

  const [superToken, managerRewardSuperfluidPool, parentContract] = await Promise.all([
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
    context.client.readContract({
      address: flowProxy,
      abi: context.contracts.NounsFlow.abi,
      functionName: "parent",
    }),
  ])

  await context.db.sql
    .update(grants)
    .set({
      superToken: superToken.toLowerCase(),
      tcr: flowTCRProxy.toLowerCase(),
      arbitrator: arbitratorProxy.toLowerCase(),
      erc20: erc20Proxy.toLowerCase(),
      parentContract: parentContract.toLowerCase(),
      tokenEmitter: tokenEmitterProxy.toLowerCase(),
      managerRewardPool: rewardPoolProxy.toLowerCase(),
      managerRewardSuperfluidPool: managerRewardSuperfluidPool.toLowerCase(),
    })
    .where(eq(grants.recipient, flowProxy.toLowerCase()))
})
