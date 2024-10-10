"use client"

import { getEthAddress } from "@/lib/utils"
import useSWR from "swr"
import { getUserGrants } from "./get-user-grants"

export function useUserGrants(address: string | undefined) {
  const { data: grants = [], ...rest } = useSWR(address ? `${address}_grants` : null, () =>
    getUserGrants(getEthAddress(address!!)),
  )

  const monthly = grants.reduce((acc, grant) => acc + Number(grant.monthlyIncomingFlowRate), 0)

  return {
    grants,
    claimableBalance: grants.reduce((acc, grant) => acc + Number(grant.claimableBalance), 0),
    earnings: {
      monthly,
      yearly: 12 * monthly,
    },
    ...rest,
  }
}
