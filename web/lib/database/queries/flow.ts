import database from "@/lib/database"
import { cache } from "react"

export const getFlowWithGrants = cache(async (flowId: string) => {
  return await database.grant.findFirstOrThrow({
    where: { id: flowId, isActive: 1 },
    include: { subgrants: true, derivedData: true },
  })
})

export const getFlow = cache(async (flowId: string) => {
  return await database.grant.findFirstOrThrow({
    where: { id: flowId, isFlow: 1, isActive: 1 },
  })
})

export type FlowWithGrants = Awaited<ReturnType<typeof getFlowWithGrants>>
