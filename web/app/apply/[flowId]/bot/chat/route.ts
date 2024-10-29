import database from "@/lib/database"
import { createAnthropic } from "@ai-sdk/anthropic"
import { convertToCoreMessages, Message, streamText } from "ai"
import { unstable_cache } from "next/cache"

export const maxDuration = 30
const anthropic = createAnthropic({ apiKey: `${process.env.ANTHROPIC_API_KEY}` })

export async function POST(request: Request) {
  const { flowId, messages }: { flowId: string; messages: Array<Message> } = await request.json()

  const flow = await unstable_cache(
    async () => {
      return database.grant.findFirstOrThrow({
        where: { id: flowId, isFlow: 1, isActive: 1 },
        include: { template: true },
      })
    },
    [`flow-${flowId}-apply-bot`],
    { revalidate: 300 },
  )()

  if (!flow) throw new Error("Flow not found")

  const result = await streamText({
    model: anthropic("claude-3-5-sonnet-20240620"),
    system: `You are a helpful assistant in an onchain grant program called "Flows". Flows is a system that provides funding to projects in different categories (called "flows"). Each flow (category) has specific set of rules and guidelines that need to be followed by the recipients. When user (future recipient) wants to apply for a grant in a specific flow, they need to submit an application. Your job is to help them with the application process, by making a conversation with them and asking them short & pricise questions.
    
    You're assistant in ${flow.title} flow. Here is more about this flow: ${flow.description}

    Here is the template for the application - we were using it in the past, but now we want to achieve something similar from conversation with user.
    
    The template: ${flow.template?.content}

    You should ask user for the title of a grant. User has option to upload images or videos - whenever it makes sesne, you may want to ask user to upload them.

    Do not ask user more than 7-10 questions. Be precise and concise. Most of our users use mobile phones to apply, so keep your questions short. 

    Ask follow-up questions if needed, but do not repeat yourself.

    Ask one question at a time. Do not ask multiple questions at once.
    `,
    messages: convertToCoreMessages(messages),
    maxSteps: 5,
    tools: {}, // ToDo: Add tool to submit application
    onFinish: async ({ responseMessages }) => {
      console.debug({ responseMessages })
    },
  })

  return result.toDataStreamResponse({})
}
