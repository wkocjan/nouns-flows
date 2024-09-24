import { ponder } from "@/generated"
import { zeroAddress } from "viem"
import { erc20VotesArbitratorAddress, erc20VotesMintableAddress, flowTcrAddress } from "../../abis"

ponder.on("NounsFlow:Initialized", async (params) => {
  const { context } = params
  const { Grant } = context.db

  const contract = context.contracts.NounsFlow.address.toLowerCase() as `0x${string}`

  const metadata = await context.client.readContract({
    address: contract,
    abi: context.contracts.NounsFlow.abi,
    functionName: "flowMetadata",
  })

  await Grant.create({
    id: contract,
    data: {
      recipient: contract,
      recipientId: "",
      blockNumber: context.contracts.NounsFlow.startBlock.toString(),
      isTopLevel: true,
      isFlow: true,
      isRemoved: false,
      parent: zeroAddress,
      votesCount: "0",
      monthlyFlowRate: "0",
      updatedAt: Math.floor(Date.now() / 1000),
      totalEarned: "0",
      claimableBalance: "0",
      tcr: flowTcrAddress[8453].toLowerCase(),
      erc20: erc20VotesMintableAddress[8453].toLowerCase(),
      arbitrator: erc20VotesArbitratorAddress[8453].toLowerCase(),
      ...metadata,
    },
  })
})
