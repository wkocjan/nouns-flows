import "server-only"

import { cookies } from "next/headers"
import { cache } from "react"
import { getFarcasterUserByEthAddress } from "../farcaster/get-user"
import { getShortEthAddress } from "../utils"
import { getEnsAvatar, getEnsNameFromAddress } from "./ens"
import { getUserAddressFromCookie } from "./get-user-from-cookie"

export type User = {
  address: `0x${string}`
  username: string
  avatar?: string
}

export const getUser = cache(async () => {
  const address = await getUserAddressFromCookie()
  if (!address) return undefined

  const farcasterUser = await getFarcasterUserByEthAddress(address)

  return {
    address,
    username:
      farcasterUser?.fname || (await getEnsNameFromAddress(address)) || getShortEthAddress(address),
    avatar: farcasterUser?.avatar_url || (await getEnsAvatar(address)) || undefined,
  } satisfies User
})

export const hasSession = () => Boolean(cookies().get("privy-session"))
