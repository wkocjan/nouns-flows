import database from "@/lib/database/edge"
import { createAnthropic } from "@ai-sdk/anthropic"
import { geolocation } from "@vercel/functions"
import { convertToCoreMessages, Message, streamText } from "ai"
import { unstable_cache } from "next/cache"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const runtime = "edge"

const anthropic = createAnthropic({ apiKey: `${process.env.ANTHROPIC_API_KEY}` })

export async function POST(request: Request) {
  const { messages, flowId }: { messages: Array<Message>; flowId: string } = await request.json()

  const userAgent = request.headers.get("user-agent")
  const { city, country, countryRegion } = geolocation(request)

  const flow = await unstable_cache(
    async () => {
      return database.grant.findFirstOrThrow({
        where: { id: flowId, isFlow: 1, isActive: 1 },
        include: { derivedData: true },
      })
    },
    [`flow-${flowId}-apply-bot`],
    { revalidate: 300 },
  )()

  if (!flow) throw new Error("Flow not found")

  const coreMessages = convertToCoreMessages(messages)

  const result = await streamText({
    model: anthropic("claude-3-5-sonnet-20241022"),
    system: `You are a helpful assistant named Flo. You help users by having friendly conversations with them.
    
    You're assistant in ${flow.title} flow. Here is more about this flow: ${flow.description}

    Here is the template for the application:
    ${flow.derivedData?.template}
    
    Here is the user agent: ${userAgent}. If the user is on mobile, be very concise.

    Here is the user's location: ${city}, ${country}, ${countryRegion}. You can use this to personalize the conversation.
    
    Be supportive and helpful in your interactions.`,
    messages: coreMessages,
  })

  return result.toDataStreamResponse({})
}
