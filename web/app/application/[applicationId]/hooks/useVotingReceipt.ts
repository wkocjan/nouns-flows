import { useReadContract } from "wagmi"

import { Address } from "viem"
import { base } from "viem/chains"
import { erc20VotesArbitratorImplAbi } from "@/lib/abis"

export function useVotingReceipt(arbitratorContract: Address, disputeId: string, voter?: Address) {
  const { data: receipt } = useReadContract({
    abi: erc20VotesArbitratorImplAbi,
    address: arbitratorContract,
    chainId: base.id,
    functionName: "getReceipt",
    args: [BigInt(disputeId), voter as Address],
    query: { enabled: !!voter },
  })

  return receipt
}
