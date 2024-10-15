"use client"

import { getEthAddress } from "@/lib/utils"
import { useReadContracts } from "wagmi"
import { rewardPoolImplAbi } from "@/lib/abis"
import { base } from "viem/chains"

export function useUserTotalRewardsBalance(pools: string[], address?: string) {
  const poolsContracts = pools.map((pool) => ({
    abi: rewardPoolImplAbi,
    chainId: base.id,
    address: getEthAddress(pool),
    functionName: "getClaimableBalanceNow",
    args: address ? [getEthAddress(address)] : undefined,
  }))

  const { data } = useReadContracts({
    contracts: poolsContracts,
  })

  return {
    totalRewardsBalance:
      data?.reduce((acc, data) => {
        if (
          typeof data.result === "bigint" ||
          typeof data.result === "string" ||
          typeof data.result === "number"
        ) {
          return acc + BigInt(data.result || 0)
        }
        return acc
      }, BigInt(0)) || BigInt(0),
  }
}
