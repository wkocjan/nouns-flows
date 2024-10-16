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

    args: address ? [getEthAddress(address)] : undefined,
  }))

  const { data: claimableBalances } = useReadContracts({
    contracts: poolsContracts.map((pool) => ({
      ...pool,
      functionName: "getClaimableBalanceNow",
    })),
  })

  const { data: memberFlowRates } = useReadContracts({
    contracts: poolsContracts.map((pool) => ({
      ...pool,
      functionName: "getMemberFlowRate",
    })),
  })

  const monthly =
    memberFlowRates?.reduce((acc, data) => {
      if (
        typeof data.result === "bigint" ||
        typeof data.result === "string" ||
        typeof data.result === "number"
      ) {
        // flow rate is in wei per second
        // so convert to seconds in a month
        return acc + Number(Number(data.result || 0) * 24 * 60 * 60 * 30) / 1e18
      }
      return acc
    }, 0) || 0

  const claimable =
    claimableBalances?.reduce((acc, data) => {
      if (
        typeof data.result === "bigint" ||
        typeof data.result === "string" ||
        typeof data.result === "number"
      ) {
        return acc + BigInt(data.result || 0)
      }
      return acc
    }, BigInt(0)) || BigInt(0)

  return {
    earnings: {
      claimable,
      monthly,
      yearly: 12 * monthly,
    },
  }
}
