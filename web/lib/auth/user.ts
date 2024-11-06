import "server-only"
import { getFarcasterUserByEthAddress } from "../farcaster/get-user"
import { getShortEthAddress } from "../utils"
import { getEnsAvatar, getEnsNameFromAddress } from "./ens"
import { getUserAddressFromCookie } from "./privy"

export type User = {
  address: `0x${string}`
  username: string
  avatar?: string
}

export async function getUser() {
  const address = await getUserAddressFromCookie()
  if (!address) return undefined

  const ensName = await getEnsNameFromAddress(address)
  const farcasterUser = await getFarcasterUserByEthAddress(address)

  return {
    address,
    username: ensName || farcasterUser?.username || getShortEthAddress(address),
    avatar: (await getEnsAvatar(address)) || farcasterUser?.pfp_url || undefined,
  } satisfies User
}
