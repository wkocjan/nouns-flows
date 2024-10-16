"use client"

import { nounsFlowImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import useSWR from "swr"
import { Address, getAddress } from "viem"
import { useReadContracts } from "wagmi"
import { getUserGrants } from "./get-user-grants"

export function useUserGrants(address: string | undefined) {
  const { data: grants = [], ...rest } = useSWR(address ? `${address}_grants` : null, () =>
    getUserGrants(getEthAddress(address!)),
  )

  const { data } = useReadContracts({
    contracts: grants.map((grant) => ({
      address: getAddress(grant.parentContract) as Address,
      abi: nounsFlowImplAbi,
      functionName: "getClaimableBalance",
      args: [address!],
      enabled: !!address,
    })),
  })

  const monthly = grants.reduce((acc, grant) => acc + Number(grant.monthlyIncomingFlowRate), 0)

  // @ts-ignore
  const claimable = (data || [])
    .map((d) => d.result)
    .filter((d) => typeof d === "bigint")
    .reduce((acc, balance) => acc + Number(balance), 0)

  return {
    grants,
    earnings: {
      claimable,
      monthly,
      yearly: 12 * monthly,
    },
    ...rest,
  }
}
