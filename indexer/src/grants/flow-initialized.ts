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
    managerRewardPool != zeroAddress
      ? context.client.readContract({
          address: managerRewardPool,
          abi: rewardPoolImplAbi,
          functionName: "rewardPool",
        })
      : Promise.resolve(zeroAddress),
  ])

  await Grant.create({
    id: contract,
    data: {
      ...metadata,
      recipient: contract,
      isTopLevel: true,
      baselinePool: baselinePool.toLowerCase(),
      bonusPool: bonusPool.toLowerCase(),
      isFlow: true,
      isRemoved: false,
      parentContract: parentContract.toLowerCase(),
      managerRewardPool: managerRewardPool.toLowerCase(),
      managerRewardSuperfluidPool: managerRewardSuperfluidPool.toLowerCase(),
      superToken: superToken.toLowerCase(),
      submitter: zeroAddress,
      votesCount: "0",
      monthlyIncomingFlowRate: "0",
      monthlyOutgoingFlowRate: "0",
      monthlyRewardPoolFlowRate: "0",
      monthlyBaselinePoolFlowRate: "0",
      monthlyBonusPoolFlowRate: "0",
      bonusMemberUnits: "0",
      baselineMemberUnits: "0",
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
