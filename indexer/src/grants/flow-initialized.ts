import { ponder } from "@/generated"
import { zeroAddress } from "viem"
import { rewardPoolImplAbi } from "../../abis"
import { Status } from "../enums"
import { base as baseContracts } from "../../addresses"
import { grants } from "../../ponder.schema"

ponder.on("NounsFlow:FlowInitialized", async (params) => {
  const { context, event } = params

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

  await context.db.insert(grants).values({
    id: contract,
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
    monthlyIncomingBaselineFlowRate: "0",
    monthlyIncomingBonusFlowRate: "0",
    monthlyOutgoingFlowRate: "0",
    monthlyRewardPoolFlowRate: "0",
    monthlyBaselinePoolFlowRate: "0",
    monthlyBonusPoolFlowRate: "0",
    bonusMemberUnits: "0",
    baselineMemberUnits: "0",
    totalEarned: "0",
    activeRecipientCount: 0,
    awaitingRecipientCount: 0,
    challengedRecipientCount: 0,
    tcr: baseContracts.FlowTCR,
    erc20: baseContracts.ERC20VotesMintable,
    arbitrator: baseContracts.ERC20VotesArbitrator,
    tokenEmitter: baseContracts.TokenEmitter,
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
  })
})
