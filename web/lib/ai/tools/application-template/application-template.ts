import database from "@/lib/database/edge"
import { tool } from "ai"
import { unstable_cache } from "next/cache"
import { z } from "zod"

export const getApplicationTemplate = tool({
  parameters: z.object({ flowId: z.string() }),
  description: "Get the application template for a specific flow",
  execute: async ({ flowId }) => {
    console.debug(`Getting the application template for flow ${flowId}`)

    const flow = await unstable_cache(
      async () => {
        return database.grant.findFirstOrThrow({
          where: { id: flowId, isFlow: 1 },
          select: { derivedData: { select: { template: true } } },
        })
      },
      [`flow-${flowId}-template`],
      { revalidate: 14400 },
    )()

    if (!flow) throw new Error("Flow not found")

    return flow.derivedData?.template
  },
})
