import "server-only"

import { cache } from "react"
import { getFarcasterUserByEthAddress } from "../farcaster/get-user"
import { getShortEthAddress } from "../utils"
import { getEnsAvatar, getEnsNameFromAddress } from "./ens"
import { getUserAddressFromCookie } from "./get-user-from-cookie"
import { postBuilderProfileRequest } from "../embedding/queue"
import { waitUntil } from "@vercel/functions"

export type User = {
  address: `0x${string}`
  username: string
  avatar?: string
}

export const getUser = cache(async () => {
  const address = await getUserAddressFromCookie()
  if (!address) return undefined

  const farcasterUser = await getFarcasterUserByEthAddress(address)

  if (farcasterUser) {
    await handleBuilderProfileGeneration(farcasterUser)
  }

  return {
    address,
    username:
      farcasterUser?.fname || (await getEnsNameFromAddress(address)) || getShortEthAddress(address),
    avatar: farcasterUser?.avatar_url || (await getEnsAvatar(address)) || undefined,
  } satisfies User
})

const handleBuilderProfileGeneration = async (farcasterUser: { fid: bigint } | null) => {
  if (farcasterUser?.fid) {
    console.log("posting builder profile request")
    waitUntil(postBuilderProfileRequest([{ fid: farcasterUser.fid.toString() }]))
  }
}
