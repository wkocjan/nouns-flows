import { getAgent } from "@/lib/ai/agents/agent"
import { getAttachmentsPrompt } from "@/lib/ai/utils/attachments"
import { anthropic } from "@ai-sdk/anthropic"
import { convertToCoreMessages, streamText } from "ai"
import { ChatBody } from "./chat-body"
import { saveConversation } from "./save-conversation"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const runtime = "edge"

export async function POST(request: Request) {
  const body: ChatBody = await request.json()
  const { messages, type, domain, data } = body

  const agent = await getAgent(type, domain, data)

  const coreMessages = convertToCoreMessages(messages)

  const result = await streamText({
    model: anthropic("claude-3-5-sonnet-20241022"),
    system: agent.prompt + getAttachmentsPrompt(coreMessages),
    messages: coreMessages,
    tools: agent.tools,
    maxSteps: 7,
    onFinish: async ({ responseMessages }) => {
      saveConversation({
        ...body,
        messages: [...coreMessages, ...responseMessages],
        address: data?.address,
      })
    },
  })

  return result.toDataStreamResponse({})
}
