"use client"

import { nounsFlowImplAbi } from "@/lib/abis"
import { useAccount, useReadContract } from "wagmi"

export function useIsFlowOwner(address: `0x${string}`) {
  const { address: userAddress } = useAccount()

  const { data: owner } = useReadContract({
    address,
    abi: nounsFlowImplAbi,
    functionName: "owner",
  })

  return owner && owner?.toLowerCase() === userAddress?.toLowerCase()
}
