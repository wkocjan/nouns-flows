"use client"

import { NOUNS_TOKEN, VOTING_POWER_SCALE } from "@/lib/config"
import { mainnet } from "viem/chains"
import { useAccount, useReadContract } from "wagmi"
import { nounsTokenAbi } from "../abis"

export function useVotingPower() {
  const { address } = useAccount()

  const { data, ...rest } = useReadContract({
    address: NOUNS_TOKEN,
    chainId: mainnet.id,
    abi: nounsTokenAbi,
    functionName: "getCurrentVotes",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })
  return {
    votingPower: (data ?? BigInt(0)) * VOTING_POWER_SCALE,
    ...rest,
  }
}
