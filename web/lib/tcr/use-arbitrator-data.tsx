"use client"

import { Address } from "viem"
import { base } from "viem/chains"
import { useAccount, useReadContract } from "wagmi"
import { erc20VotesArbitratorAbi } from "../abis"

export function useArbitratorData(contract: Address, disputeId: string, chainId = base.id) {
  const { address: owner } = useAccount()

  const { data: votingPower } = useReadContract({
    abi: erc20VotesArbitratorAbi,
    address: contract,
    chainId,
    functionName: "votingPowerInCurrentRound",
    args: [BigInt(disputeId), owner],
  })

  return {
    // votingPower: votingPower?.result || BigInt(0),
  }
}
