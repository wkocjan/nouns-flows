"use server"

import database from "@/lib/database"
import { unstable_cache } from "next/cache"

export const getFlowForToken = unstable_cache(
  async (tokenContract: `0x${string}`) => {
    if (!tokenContract) return null

    const flow = await database.grant.findFirst({
      where: { erc20: tokenContract, isRemoved: 0, isFlow: 1, isActive: 1 },
    })

    return flow
  },
  ["flow-for-token"],
  { revalidate: 60 }, // 1 minute
)
