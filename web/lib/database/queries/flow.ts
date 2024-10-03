"use server"

import database from "@/lib/database"
import { cache } from "react"
import { unstable_cache } from "next/cache"

export const getFlowWithGrants = cache(async (flowId: string) => {
  return await database.grant.findFirstOrThrow({
    where: { id: flowId, isActive: 1 },
    include: { subgrants: true },
  })
})

export const getFlow = cache(async (flowId: string) => {
  return await database.grant.findFirstOrThrow({
    where: { id: flowId, isFlow: 1, isActive: 1 },
  })
})

export type FlowWithGrants = Awaited<ReturnType<typeof getFlowWithGrants>>

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
