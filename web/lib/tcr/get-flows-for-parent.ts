"use server"

import database from "@/lib/database/edge"
import { unstable_cache } from "next/cache"

export const getFlowsForParent = unstable_cache(
  async (parentContract: `0x${string}`) => {
    if (!parentContract) return []

    const grants = await database.grant.findMany({
      where: { parentContract, isRemoved: 0, isFlow: 1, isActive: 1 },
    })

    const parent = await database.grant.findFirstOrThrow({
      where: { recipient: parentContract, isFlow: 1, isActive: 1 },
    })

    return [parent, ...grants]
  },
  ["flows-for-parent"],
  { revalidate: 60 }, // 1 minute
)
