import { ponder } from "@/generated"
import { rewardPoolImplAbi } from "../../abis"
import { grants } from "../../ponder.schema"
import { eq } from "@ponder/core"

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

  // Find grant with matching recipient
  const matchingGrants = await context.db.sql
    .select()
    .from(grants)
    .where(eq(grants.recipient, flowProxy.toLowerCase()))

  if (matchingGrants.length > 1) {
    throw new Error("Multiple grants found with same recipient")
  }

  if (matchingGrants.length === 0) {
    throw new Error("No grant found with recipient " + flowProxy.toLowerCase())
  }

  const grant = matchingGrants[0]

  if (!grant) {
    throw new Error("No grant found with recipient " + flowProxy.toLowerCase())
  }

  await context.db.update(grants, { id: grant.id }).set({
    superToken: superToken.toLowerCase(),
    tcr: flowTCRProxy.toLowerCase(),
    arbitrator: arbitratorProxy.toLowerCase(),
    erc20: erc20Proxy.toLowerCase(),
    parentContract: parentContract.toLowerCase(),
    tokenEmitter: tokenEmitterProxy.toLowerCase(),
    managerRewardPool: rewardPoolProxy.toLowerCase(),
    managerRewardSuperfluidPool: managerRewardSuperfluidPool.toLowerCase(),
  })
})
