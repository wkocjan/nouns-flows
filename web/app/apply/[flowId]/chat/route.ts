import { applicationRules, isProd } from "@/lib/ai/prompts/rules/production"
import { createAnthropic } from "@ai-sdk/anthropic"
import { convertToCoreMessages, Message, streamText } from "ai"
import { getFlowContextPrompt } from "@/lib/ai/prompts/flow/flow-context"
import { queryEmbeddings } from "@/lib/ai/tools/embeddings/tool"
import { embeddingToolPrompt } from "@/lib/ai/tools/embeddings/prompt"
import { submitApplication } from "@/lib/ai/tools/applications/submit-application"
import { applicationPrompt } from "@/lib/ai/tools/applications/prompt"
import { applicationToolPrompt } from "@/lib/ai/tools/applications/tool-prompt"
import { onFinishApplicationChat } from "@/lib/ai/tools/applications/on-finish"
import { getAgentPrompt } from "@/lib/ai/agents/get-agent-prompt"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const runtime = "edge"

const anthropic = createAnthropic({ apiKey: `${process.env.ANTHROPIC_API_KEY}` })

export async function POST(request: Request) {
  const {
    chatId,
    flowId,
    messages,
    address,
  }: { chatId: string; flowId: string; messages: Array<Message>; address: string } =
    await request.json()

  const coreMessages = convertToCoreMessages(messages)

  const [flowContextPrompt, agentPrompt] = await Promise.all([
    getFlowContextPrompt(flowId),
    getAgentPrompt("flo", "application", request, address),
  ])

  const result = await streamText({
    model: anthropic("claude-3-5-sonnet-20241022"),
    system: `
    ${agentPrompt}

    To start, you should ask the user for their name and social links (like Twitter, Farcaster, Instagram, Github, etc).

    Inform the user at the start that you are helping them with creating a draft application, 
    and they'll be able to view and edit it before submitting on the draft page after you're done together.
    
    # Flows context
    ${flowContextPrompt}
    
    # How to help the user
    ${applicationPrompt()}

    # Tools
    ${embeddingToolPrompt(flowId)}
    ${applicationToolPrompt(flowId, coreMessages)}

    # Final checks
    ${isProd ? applicationRules : ""}
    `,
    messages: coreMessages,
    tools: { queryEmbeddings, submitApplication: submitApplication(flowId) },
    maxSteps: 7,
    onFinish: async ({ responseMessages }) => {
      await onFinishApplicationChat({
        coreMessages,
        responseMessages,
        flowId,
        chatId,
        address,
      })
    },
  })

  return result.toDataStreamResponse({})
}
