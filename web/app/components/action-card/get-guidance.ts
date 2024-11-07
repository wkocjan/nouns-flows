import "server-only"

import { getAgentPrompt } from "@/lib/ai/agents/get-agent-prompt"
import { baseRules, isProd } from "@/lib/ai/prompts/rules/production"
import { anthropic } from "@/lib/ai/providers/anthropic"
import { embeddingToolPrompt } from "@/lib/ai/tools/embeddings/prompt"
import { searchEmbeddings } from "@/lib/ai/tools/embeddings/query"
import { generateObject } from "ai"
import { unstable_cache } from "next/dist/server/web/spec-extension/unstable-cache"
import { z } from "zod"

export async function getGuidance(address: string | undefined) {
  const initialContext = await unstable_cache(
    async () => {
      return searchEmbeddings({
        types: ["grant", "grant-application", "flow", "cast"],
        query: `What flows (categories), grants, and grant applications are available? What we know about user ${address}?`,
        users: address ? [address] : undefined,
        tags: [],
        numResults: 100,
        groups: [],
      })
    },
    [`initial-context-${address ?? "guest"}`],
    { revalidate: 3600 * 3 }, // 3 hours
  )()

  const agentPrompt = await getAgentPrompt("flo", "guidance", address)

  const { object } = await generateObject({
    model: anthropic("claude-3-5-sonnet-latest"),
    schema: z.object({
      text: z.string().describe("The guidance message to the user."),
      actions: z
        .array(z.object({ text: z.string().max(12), link: z.string() }))
        .describe("Actions the user can take."),
    }),
    system: `${agentPrompt}\n\nInitial context from the database using the queryEmbeddings tool:\n${JSON.stringify(initialContext)}. Info about the tool: ${embeddingToolPrompt()}`,
    prompt: `
    ${address ? `User ${address}` : "Guest"} just visited the home page.

    Write a short message to the user explaining what they should do next on the platform.

    Do not introduce yourself. Do not say you have access to some data or know about user. Just write a message to the user. No need to inform them about your context awareness.

    When deciding what to say, think about what the user is likely to be interested.

    Examples:
    - If the user is not a builder yet, you may suggest they apply for a grant. Would be nice to suggest 1-2 flows with smaller number of grants.
    - If the user is not logged in (guest), you may just briefly introduce the platform.
    - If the user is a builder without recent activity, you may suggest posting update on Farcaster.

    Use 2-3 paragraphs and no more than 180 characters.

    Always provide at least one action the user can take, with text and link. Do not provide more than 2 actions.
    Action texts should be short

    Do not onboard user to web3 or crypto. Do not use any jargon, technical terms or do not refer to grants as "projects".

    Try to make the message as personalized as possible.
    

    # Final checks
    ${isProd ? baseRules : ""}    
    `,
  })

  return object
}
