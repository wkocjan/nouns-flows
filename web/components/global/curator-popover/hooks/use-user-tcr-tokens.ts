"use client"

import { getEthAddress } from "@/lib/utils"
import useSWR from "swr"
import { getUserTcrTokens } from "./get-user-tcr-tokens"

export function useUserTcrTokens(address: string | undefined) {
  const { data, ...rest } = useSWR(address ? `${address}_tcr_tokens` : null, () =>
    getUserTcrTokens(getEthAddress(address!!.toLowerCase())),
  )

  return {
    tokens: data || [],
    totalBalance: data?.reduce((acc, token) => acc + BigInt(token.amount), BigInt(0)),
    ...rest,
  }
}
