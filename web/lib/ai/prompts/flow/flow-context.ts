import database from "@/lib/database/edge"
import { unstable_cache } from "next/cache"

export async function getFlowContextPrompt(flowId: string) {
  const flow = await unstable_cache(
    async () => {
      return database.grant.findFirstOrThrow({
        where: { id: flowId, isFlow: 1, isActive: 1 },
        include: { derivedData: true },
      })
    },
    [`flow-${flowId}-context`],
    { revalidate: 300 },
  )()

  if (!flow) throw new Error("Flow not found")

  return `You are in the context of the ${flow.title} flow. Here is more about this flow:
${flow.description}

Each flow has its own focus area, requirements, and evaluation criteria. The program is designed to be flexible while maintaining high standards for funded projects.

Here is the template for creating an application to this flow to receive funding:
${flow.derivedData?.template}

Here's more data about the flow, up to date as of ${flow.updatedAt}:
${JSON.stringify(flow)}
`
}
