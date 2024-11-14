import { getAgent } from "@/lib/ai/agents/agent"
import { getAttachmentsPrompt } from "@/lib/ai/utils/attachments"
import { getUserAddressFromCookie } from "@/lib/auth/get-user-from-cookie"
import { anthropic } from "@ai-sdk/anthropic"
import { convertToCoreMessages, streamText } from "ai"
import { ChatBody } from "./chat-body"
import { saveConversation } from "./save-conversation"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const runtime = "nodejs"

export async function POST(request: Request) {
  const body: ChatBody = await request.json()
  const { messages, type, context } = body

  try {
    const address = await getUserAddressFromCookie()
    const data = { ...body.data, address }

    const agent = await getAgent(type, data)

    const coreMessages = convertToCoreMessages(messages)

    const result = await streamText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      system: agent.prompt + getAttachmentsPrompt(coreMessages) + context,
      messages: coreMessages,
      tools: agent.tools,
      maxSteps: 7,
      onFinish: async ({ responseMessages }) => {
        saveConversation({
          ...body,
          messages: [...coreMessages, ...responseMessages],
          address,
        })
      },
    })

    return result.toDataStreamResponse({})
  } catch (error) {
    return new Response((error as any).message || "Internal server error", { status: 500 })
  }
}
