import "server-only"

import { getFarcasterUserByEthAddress } from "../farcaster/get-user"
import { getShortEthAddress } from "../utils"
import { getEnsAvatar, getEnsNameFromAddress } from "./ens"
import { getUserAddressFromCookie } from "./get-user-from-cookie"

export type User = {
  address: `0x${string}`
  username: string
  avatar?: string
}

export async function getUser() {
  console.time("getUserAddressFromCookie")
  const address = await getUserAddressFromCookie()
  console.timeEnd("getUserAddressFromCookie")

  if (!address) return undefined

  console.time("getFarcasterUser")
  const farcasterUser = await getFarcasterUserByEthAddress(address)
  console.timeEnd("getFarcasterUser")

  console.time("getUsername")
  const username =
    farcasterUser?.fname || (await getEnsNameFromAddress(address)) || getShortEthAddress(address)
  console.timeEnd("getUsername")

  console.time("getAvatar")
  const avatar = farcasterUser?.avatar_url || (await getEnsAvatar(address)) || undefined
  console.timeEnd("getAvatar")

  return {
    address,
    username,
    avatar,
  } satisfies User
}
