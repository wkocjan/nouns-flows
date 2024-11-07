import { getResizedImage } from "@/lib/image/sharp-resize"
import { createAnthropic } from "@ai-sdk/anthropic"
import { Cast, Grant } from "@prisma/flows"
import { generateObject } from "ai"
import { z } from "zod"

const anthropic = createAnthropic({ apiKey: `${process.env.ANTHROPIC_API_KEY}` })

export async function analyzeCast(cast: Cast, grants: Array<Grant & { flow: Grant }>) {
  try {
    if (grants.length === 0) {
      return {
        grantId: null,
        isGrantUpdate: false,
        reason: "No grants provided",
        confidenceScore: 1,
      }
    }

    const imageMessages = await Promise.all(
      cast.images.map(async (url) => await getResizedImage(url)),
    )

    const filteredImageMessages = imageMessages.filter(
      (msg): msg is { type: "image"; image: string } => msg !== null,
    )

    const { object } = await generateObject({
      model: anthropic("claude-3-5-sonnet-20241022"),
      schema: z.object({
        grantId: z.string().optional(),
        isGrantUpdate: z.boolean(),
        reason: z.string().describe("Reason for why it's a grant update, or not"),
        confidenceScore: z.number().describe("Confidence score whether it's a grant update or not"),
      }),
      messages: [
        {
          role: "system",
          content: `
        You are a helpful assistant that analyzes text & images of Farcaster cast to determine if it should be
        included on the specific Grant page in the "Updates" section. You will be given a cast, and a list of grants that
        the author of the cast is a recipient of. You will need to determine if the cast is an status update for one of the grants.
        If it is, you will need to return the grantId and your confidence score why you think this cast is an update for this specific grant.
        If the cast is not a grant update - return an empty grantId.
        If the cast is generic comment about grants program - return an empty grantId.
        If the cast is status update, but not about any of the grants listed below - return an empty grantId.
        Feel free to infer or otherwise make basic logical assumptions to determine if the cast is a grant update. Eg: if someone posts about buying supplies but doesn't mention the grant, you can assume it's an update for the grant.
        
        The cast's author is recipient of the following grants:
        ${grants
          .map(
            (g) =>
              `Grant ID: ${g.id}\nGrant URL: https://flows.wtf/item/${g.id}\nTitle: ${g.title}\nGrant category: ${g.flow.title}\nDescription: ${g.description}`,
          )
          .join("\n\n\n")}
        `,
        },
        {
          role: "user",
          content: [{ type: "text", text: cast.text }, ...filteredImageMessages],
        },
      ],
      maxTokens: 1500,
    })

    return { ...object, cast }
  } catch (e) {
    console.error(`Error analyzing cast ${cast.hash}:`, e)
    return {
      grantId: null,
      isGrantUpdate: false,
      reason: "Error analyzing cast",
      confidenceScore: 1,
    }
  }
}
