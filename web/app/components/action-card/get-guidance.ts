import "server-only"

import { getAgent } from "@/lib/ai/agents/agent"
import { anthropic } from "@/lib/ai/providers/anthropic"
import { searchEmbeddings } from "@/lib/ai/tools/embeddings/search-embeddings"
import { generateObject } from "ai"
import { unstable_cache } from "next/dist/server/web/spec-extension/unstable-cache"
import { z } from "zod"

export async function getGuidance(address: string | undefined) {
  try {
    const initialContext = await unstable_cache(
      async () => {
        return searchEmbeddings({
          types: ["grant", "grant-application", "flow"],
          query: `What flows (categories), grants, and grant applications are available? What do we know about the user ${address}?`,
          users: address ? [address] : undefined,
          tags: [],
          numResults: 10,
          groups: [],
        })
      },
      [`initial-context-${address ?? "guest"}`],
      { revalidate: 3600 * 3 }, // 3 hours
    )()

    const agent = await getAgent("flo", "guidance", { address })

    const { object } = await generateObject({
      model: anthropic("claude-3-5-sonnet-latest"),
      schema: z.object({
        text: z.string().describe("The guidance message to the user."),
        actions: z
          .array(z.object({ text: z.string().max(12), link: z.string() }))
          .describe("Actions the user can take."),
      }),
      system: `${agent.prompt}\n\nInitial context from the database using the queryEmbeddings tool:\n${JSON.stringify(initialContext)}.`,
      prompt: `
    ${address ? `User ${address}` : "Guest"} just visited the home page.

    Write a short message to the user explaining what they should do next on the platform.

    Do not introduce yourself. Do not say you have access to data about user. Just write a message to the user. No need to inform them about your context awareness or why you say what you say.

    When deciding what to say, think about what the user is likely to be interested.

    Examples:
    - If the user is not a builder yet, you may suggest they apply for a grant. Would be nice to suggest 1-2 flows with smaller number of grants.
    - If the user is not logged in (guest), you may just briefly introduce the platform.
    - If the user is a builder without recent activity, you may suggest posting update on Farcaster.

    Use 2-3 paragraphs and no more than 160 characters.

    Always provide at least one action the user can take, with text and link. Do not provide more than 2 actions.
    Action texts should be short

    Do not onboard user to web3 or crypto. Do not use any jargon, technical terms or do not refer to grants as "projects".

    Try to make the message as personalized as possible.

    This is a general good message for new users or people who are not builders.
    "Welcome to Flows! This is were people get paid for making positive impact in their communities."    
    `,
    })

    return object
  } catch (error) {
    console.error(error)
    return {
      text: "Welcome to Flows! This is were builders get paid for making positive impact in their communities.\n\n Whether you clean beaches, organize meetups, or create content - there's a place for you here.",
      actions: [
        {
          text: "Apply for a grant",
          link: "/apply",
        },
      ],
    }
  }
}
