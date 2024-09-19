"use client"

import { getEthAddress } from "@/lib/utils"
import useSWR from "swr"
import { getUserGrants } from "./get-user-grants"

export function useUserGrants(address: string | undefined) {
  const { data, ...rest } = useSWR(address ? `${address}_grants` : null, () =>
    getUserGrants(getEthAddress(address!!)),
  )

  return {
    grants: data || [],
    ...rest,
  }
}
