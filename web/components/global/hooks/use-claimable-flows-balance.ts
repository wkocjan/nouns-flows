"use client"

import { useAccount } from "wagmi"
import useSWR from "swr"
import { getClaimableBalance } from "./get-claimable-balance"

export const useClaimableFlowsBalance = (contract: `0x${string}`) => {
  const { address } = useAccount()

  const { data: balance, isLoading } = useSWR(
    contract && address ? [`${contract}_${address}_balance`] : null,
    () => getClaimableBalance(contract, address),
  )

  return {
    balance: balance || BigInt(0),
    isLoading,
  }
}
