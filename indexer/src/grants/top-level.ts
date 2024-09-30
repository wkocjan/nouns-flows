import { ponder } from "@/generated"
import { zeroAddress } from "viem"
import {
  erc20VotesArbitratorAddress,
  erc20VotesMintableAddress,
  flowTcrAddress,
  tokenEmitterAddress,
} from "../../abis"
import { Status } from "../enums"

ponder.on("NounsFlow:Initialized", async (params) => {
  const { context } = params
  const { Grant } = context.db

  const contract = context.contracts.NounsFlow.address.toLowerCase() as `0x${string}`

  const metadata = await context.client.readContract({
    address: contract,
    abi: context.contracts.NounsFlow.abi,
    functionName: "flowMetadata",
  })

  const currentTime = Math.floor(Date.now() / 1000)

  await Grant.create({
    id: contract,
    data: {
      ...metadata,
      recipient: contract,
      isTopLevel: true,
      isFlow: true,
      isRemoved: false,
      parentContract: zeroAddress,
      submitter: zeroAddress,
      votesCount: "0",
      monthlyFlowRate: "0",
      totalEarned: "0",
      claimableBalance: "0",
      tcr: flowTcrAddress[8453].toLowerCase(),
      erc20: erc20VotesMintableAddress[8453].toLowerCase(),
      arbitrator: erc20VotesArbitratorAddress[8453].toLowerCase(),
      tokenEmitter: tokenEmitterAddress[8453].toLowerCase(),
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
