import database from "@/lib/database"
import { cache } from "react"

export const getFlowWithGrants = cache(async (flowId: string) => {
  return await database.grant.findFirstOrThrow({
    where: { id: flowId, isFlow: 1 },
    include: { subgrants: { where: { isFlow: 0, isRemoved: 0 } } },
  })
})

export type FlowWithGrants = Awaited<ReturnType<typeof getFlowWithGrants>>
