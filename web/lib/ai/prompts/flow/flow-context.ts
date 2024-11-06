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

  return `Flows is a system that provides funding to projects in different categories (called "flows"). Each flow (category) has specific set of rules and guidelines that need to be followed by the recipients.

The program embodies nounish values, which include but are not limited to:
- Do good with no expectation of return
- Create positive externalities 
- Embrace absurdity & difference
- Teach people about nouns & crypto
- Have fun

These values are core to the broader grants program and community. They should be communicated naturally and in ways that relate to the specific flow and builder.

The program aims to support builders while fostering a community aligned with these values. Flows provides both funding and guidance to help projects succeed.

You are in the context of the ${flow.title} flow. Here is more about this flow:
${flow.description}

Each flow has its own focus area, requirements, and evaluation criteria. The program is designed to be flexible while maintaining high standards for funded projects.

Here is the template for creating an application to this flow to receive funding:
${flow.derivedData?.template}

Here's more data about the flow, up to date as of ${flow.updatedAt}:
${JSON.stringify(flow)}

Flows operates onchain, bringing transparency and permanence to grant funding. This allows the community to see how funds are allocated and track project progress over time.`
}
