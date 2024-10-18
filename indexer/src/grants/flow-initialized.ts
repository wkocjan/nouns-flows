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

  const {
    parent: parentContract,
    managerRewardPool,
    superToken,
    baselinePool,
    baselinePoolFlowRatePercent,
    bonusPool,
    managerRewardPoolFlowRatePercent,
  } = event.args

  const contract = context.contracts.NounsFlow.address.toLowerCase() as `0x${string}`

  const [metadata, managerRewardSuperfluidPool] = await Promise.all([
    context.client.readContract({
      address: contract,
      abi: context.contracts.NounsFlow.abi,
      functionName: "flowMetadata",
    }),
    context.client.readContract({
      address: managerRewardPool,
      abi: rewardPoolImplAbi,
      functionName: "rewardPool",
    }),
  ])

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
      bonusMemberUnits: "0",
      baselineMemberUnits: "0",
      totalMemberUnits: "0",
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
      updatedAt: Number(event.block.timestamp),
      createdAt: Number(event.block.timestamp),
      isDisputed: false,
      isResolved: false,
      evidenceGroupID: "",
      isActive: true,
    },
  })
})

ponder.on("NounsFlowChildren:FlowInitialized", async (params) => {
  const { event, context } = params
  const { Grant } = context.db

  const contract = event.log.address.toLowerCase() as `0x${string}`

  const {
    baselinePool,
    bonusPool,
    managerRewardPool,
    superToken,
    parent,
    managerRewardPoolFlowRatePercent,
    baselinePoolFlowRatePercent,
  } = event.args

  const managerRewardSuperfluidPool = await context.client.readContract({
    address: managerRewardPool,
    abi: rewardPoolImplAbi,
    functionName: "rewardPool",
  })

  await Grant.updateMany({
    where: { recipient: contract },
    data: {
      baselinePool: baselinePool.toLowerCase(),
      bonusPool: bonusPool.toLowerCase(),
      parentContract: parent.toLowerCase(),
      managerRewardPool: managerRewardPool.toLowerCase(),
      superToken: superToken.toLowerCase(),
      managerRewardPoolFlowRatePercent,
      baselinePoolFlowRatePercent,
      managerRewardSuperfluidPool: managerRewardSuperfluidPool.toLowerCase(),
      updatedAt: Number(event.block.timestamp),
    },
  })
})
