import { getLocationPrompt } from "@/lib/ai/prompts/user-data/location"
import { getUserAgentPrompt } from "@/lib/ai/prompts/user-data/user-agent"
import { applicationRules, isProd } from "@/lib/ai/prompts/rules/production"
import { createAnthropic } from "@ai-sdk/anthropic"
import { convertToCoreMessages, Message, streamText } from "ai"
import { getFlowContextPrompt } from "@/lib/ai/prompts/flow/flow-context"
import { floSystemPrompt } from "@/lib/ai/agents/flo/personality"
import { queryEmbeddings } from "@/lib/ai/tools/embeddings/tool"
import { embeddingToolPrompt } from "@/lib/ai/tools/embeddings/prompt"
import { getFarcasterPrompt } from "@/lib/ai/prompts/user-data/farcaster"
import { submitApplication } from "@/lib/ai/tools/applications/submit-application"
import { applicationPrompt } from "@/lib/ai/tools/applications/prompt"
import { applicationToolPrompt } from "@/lib/ai/tools/applications/tool-prompt"

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

  const [flowContextPrompt, farcasterPrompt] = await Promise.all([
    getFlowContextPrompt(flowId),
    getFarcasterPrompt(address),
  ])

  const coreMessages = convertToCoreMessages(messages)

  const result = await streamText({
    model: anthropic("claude-3-5-sonnet-20241022"),
    system: `
    # Your personality as a helpful assistant
    ${floSystemPrompt}

    # User data
    ${getUserAgentPrompt(request)}
    ${getLocationPrompt(request)} Make sure the final application you output and submit is in English.
    The address of the user is ${address}.
    ${farcasterPrompt}

    To start, you should ask the user for their name and social links (like Twitter, Farcaster, Instagram, Github, etc).

    Inform the user at the start that you are helping them with creating a draft application, 
    and they'll be able to view and edit it before submitting on the draft page after you're done together.
    
    ${flowContextPrompt}
    
    # How to help the user
    ${applicationPrompt()}

    # Tools
    ${embeddingToolPrompt(flowId)}
    ${applicationToolPrompt(flowId, coreMessages)}

    # Final checks
    ${isProd ? applicationRules : ""}
    Ensure the final draft is in English, even if the user initially picked another language. Do not forget to do this, the final draft that you submit must be in English.
    `,
    messages: coreMessages,
    tools: { queryEmbeddings, submitApplication: submitApplication(flowId) },
    maxSteps: 7,
  })

  return result.toDataStreamResponse({})
}
