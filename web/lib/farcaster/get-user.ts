import { farcasterDb } from "@/lib/database/farcaster"

export const getFarcasterUserByEthAddress = async (address: `0x${string}`) => {
  try {
    const users = await getFarcasterUsersByEthAddress(address)
    if (!users || users.length === 0) return null

    return users[0]
  } catch (e: any) {
    console.error(e?.message)
    return null
  }
}

export const getFarcasterUsersByEthAddress = async (rawAddress: `0x${string}`) => {
  try {
    const address = rawAddress.toLowerCase()

    const users = await farcasterDb.profile.findMany({
      where: {
        verified_addresses: {
          has: address,
        },
      },
      cacheStrategy: { ttl: 600 },
    })

    return users
  } catch (e: any) {
    console.error(e?.message)
    return []
  }
}
