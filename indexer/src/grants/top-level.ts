import { ponder } from "@/generated"
import { zeroAddress } from "viem"
import {
  erc20VotesArbitratorAddress,
  erc20VotesMintableAddress,
  flowTcrAddress,
  rewardPoolImplAbi,
  tokenEmitterAddress,
} from "../../abis"
import { Status } from "../enums"

ponder.on("NounsFlow:FlowInitialized", async (params) => {
  const { context, event } = params
  const { Grant } = context.db

  const { parent: parentContract, managerRewardPool, superToken } = event.args

  const contract = context.contracts.NounsFlow.address.toLowerCase() as `0x${string}`

  const metadata = await context.client.readContract({
    address: contract,
    abi: context.contracts.NounsFlow.abi,
    functionName: "flowMetadata",
  })

  const [
    baselinePool,
    bonusPool,
    managerRewardSuperfluidPool,
    managerRewardPoolFlowRatePercent,
    baselinePoolFlowRatePercent,
  ] = await Promise.all([
    context.client.readContract({
      address: contract,
      abi: context.contracts.NounsFlow.abi,
      functionName: "baselinePool",
    }),
    context.client.readContract({
      address: contract,
      abi: context.contracts.NounsFlow.abi,
      functionName: "bonusPool",
    }),
    context.client.readContract({
      address: managerRewardPool,
      abi: rewardPoolImplAbi,
      functionName: "rewardPool",
    }),
    context.client.readContract({
      address: contract,
      abi: context.contracts.NounsFlow.abi,
      functionName: "managerRewardPoolFlowRatePercent",
    }),
    context.client.readContract({
      address: contract,
      abi: context.contracts.NounsFlow.abi,
      functionName: "baselinePoolFlowRatePercent",
    }),
  ])

  const currentTime = Math.floor(Date.now() / 1000)

  await Grant.create({
    id: contract,
    data: {
      ...metadata,
      recipient: contract,
      isTopLevel: true,
      baselinePool,
      bonusPool,
      isFlow: true,
      isRemoved: false,
      parentContract,
      managerRewardPool,
      managerRewardSuperfluidPool,
      superToken,
      submitter: zeroAddress,
      votesCount: "0",
      monthlyIncomingFlowRate: "0",
      monthlyOutgoingFlowRate: "0",
      monthlyRewardPoolFlowRate: "0",
      monthlyBaselinePoolFlowRate: "0",
      monthlyBonusPoolFlowRate: "0",
      totalEarned: "0",
      tcr: flowTcrAddress[8453].toLowerCase(),
      erc20: erc20VotesMintableAddress[8453].toLowerCase(),
      arbitrator: erc20VotesArbitratorAddress[8453].toLowerCase(),
      tokenEmitter: tokenEmitterAddress[8453].toLowerCase(),
      managerRewardPoolFlowRatePercent,
      baselinePoolFlowRatePercent,
      challengePeriodEndsAt: 0,
      status: Status.Registered,
      flowId: "",
      updatedAt: currentTime,
      createdAt: currentTime,
      isDisputed: false,
      isResolved: false,
      evidenceGroupID: "",
      isActive: true,
    },
  })
})
