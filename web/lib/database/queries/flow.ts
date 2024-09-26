import database from "@/lib/database"
import { cache } from "react"

export const getFlowWithGrants = cache(async (flowId: string) => {
  return await database.grant.findFirstOrThrow({
    where: { id: flowId, isRemoved: 0 },
    include: { subgrants: { where: { isRemoved: 0 } } },
  })
})

export const getFlow = cache(async (flowId: string) => {
  return await database.grant.findFirstOrThrow({
    where: { id: flowId, isFlow: 1, isRemoved: 0 },
  })
})

export type FlowWithGrants = Awaited<ReturnType<typeof getFlowWithGrants>>
