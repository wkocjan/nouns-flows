import database, { getCacheStrategy } from "@/lib/database/edge"
import { cache } from "react"

export const getFlowWithGrants = cache(async (flowId: string) => {
  return await database.grant.findFirstOrThrow({
    where: { id: flowId, isActive: 1 },
    include: { subgrants: true, derivedData: true },
    ...getCacheStrategy(120),
  })
})

export const getFlow = cache(async (flowId: string) => {
  return await database.grant.findFirstOrThrow({
    where: { id: flowId, isFlow: 1, isActive: 1 },
    ...getCacheStrategy(120),
  })
})

export type FlowWithGrants = Awaited<ReturnType<typeof getFlowWithGrants>>
