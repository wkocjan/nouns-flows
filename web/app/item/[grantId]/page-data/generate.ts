import "server-only"

import { getAgent } from "@/lib/ai/agents/agent"
import { anthropic } from "@/lib/ai/providers/anthropic"
import database from "@/lib/database/edge"
import { farcasterDb } from "@/lib/database/farcaster-edge"
import { generateObject } from "ai"
import dynamicIconImports from "lucide-react/dynamicIconImports"
import { GrantPageData, grantPageSchema } from "./schema"

export async function generateGrantPageData(id: string): Promise<GrantPageData | null> {
  const [{ flow, ...grant }, stories, casts] = await Promise.all([
    database.grant.findUniqueOrThrow({
      where: { id, isActive: 1, isTopLevel: 0 },
      select: {
        recipient: true,
        title: true,
        description: true,
        image: true,
        tagline: true,
        createdAt: true,
        flow: { select: { id: true, tagline: true, title: true, description: true } },
      },
    }),
    database.story.findMany({
      where: { grant_ids: { has: id } },
      select: {
        title: true,
        summary: true,
        timeline: true,
        completeness: true,
        header_image: true,
        updated_at: true,
        media_urls: true,
        tagline: true,
        grant_ids: true,
        participants: true,
      },
      orderBy: { created_at: "desc" },
      take: 100,
    }),
    farcasterDb.cast.findMany({
      select: {
        timestamp: true,
        text: true,
        embed_summaries: true,
        embeds: true,
        profile: {
          select: {
            display_name: true,
            verified_addresses: true,
            fname: true,
          },
        },
      },
      where: {
        computed_tags: { has: id },
        parent_hash: null,
        deleted_at: null,
      },
      orderBy: { created_at: "desc" },
      take: 100,
    }),
  ])

  const iconNames = Object.keys(dynamicIconImports)

  const agent = await getAgent("flo", { grantId: id, address: grant.recipient })

  const result = await generateObject({
    model: anthropic("claude-3-5-sonnet-latest"),
    schema: grantPageSchema,
    system: agent.prompt,
    prompt: `You are an experienced data analyst and project manager specializing in web3 projects. Your task is to analyze grant information, related stories, and recipient details to create a structured and informative grant page. The output will be a JSON object containing all the required sections.

    First, review the following data carefully:

    <grant_data>
    ${JSON.stringify(grant)}
    </grant_data>

    <flow_data>
    ${JSON.stringify(flow)}
    </flow_data>

    <stories_data>
    ${JSON.stringify(stories)}
    </stories_data>

    <casts_data>
    ${JSON.stringify(casts)}
    </casts_data>

    Available Icon Names:
    <icon_names>
    ${JSON.stringify(iconNames)}
    </icon_names>

    Before creating the JSON object, conduct a thorough analysis of the provided data. Conduct your analysis within <detailed_analysis> tags, following this structure:

    2. Grant Data Analysis:
      - Summarize key information from the grant's description (in markdown format).
      - List the grant's main objectives.
      - Extract other relevant details about the grant and builder(s).

    3. Flow Data Analysis:
      - Explain how the grant fits into the overall flow.
      - Identify any dependencies or connections with other projects.

    4. Stories Data Analysis:
      - Summarize important points about the grant's progress.
      - List significant milestones achieved, with dates if available.
      - For each story, provide a brief summary and note significant events, achievements, or challenges.
      - Identify common themes or patterns across the stories.
      - List all images from the stories.

    5. Casts Data Analysis:
      - Extract any additional context not covered in the grant description or stories.
      - Note any recurring topics or concerns mentioned in the casts.

    6. Cross-referencing:
      - Identify information that appears in multiple data sources.
      - Note any discrepancies or contradictions between different sources.

    7. Metrics Analysis:
      - List all potential metrics extracted from the data.
      - For each metric, note its source and potential impact.
      - Rank metrics by relevance and impact.

    8. Social Links Analysis:
      - List all potential social links mentioned in the data.
      - Note the platform and associated information for each link.
      - Verify the validity and relevance of each link.

    9. Content Mapping:
      - For each section of the JSON structure (about, small_cards, metrics, timeline, plan, builder, media, dynamic_cards), list relevant pieces of extracted information.
      - Brainstorm 2-3 ideas for content in each section based on the analyzed data.

    10. Challenges and Solutions:
        - List any challenges or obstacles mentioned in the data.
        - Brainstorm potential solutions or approaches to these challenges.
        - Identify any information gaps that might need creative filling.

    11. Icon Selection:
        - For each instance where an icon is needed, list all potential icon choices.
        - Cross-check each icon choice against the provided icon_names dataset to ensure only valid icons are used.

    12. Final Summary:
        - Provide a concise summary of the most crucial findings across all sections.
        - Highlight the unique aspects of this grant that should be emphasized in the final output.

    After completing your analysis, create a JSON object containing the content for the grant page. Ensure all required fields are present and not null, and that text lengths are within the specified limits. Follow these guidelines:

    1. About Section:
      - Title: Shorten if very long, use normal case
      - Tagline: Use grant tagline or generate based on description
      - Cover Image: Provide URL of the most relevant image, defaulting to "grant.image" field if unsure

    2. Four Small Cards:
      - Why: One sentence (max 10 words) explaining the grant's main goal
      - How: Explain how the goal will be achieved (max 90 characters)
      - Focus: Describe what's the current focus of builder(s) (max 120 characters)
      - Who: Short introduction of grant recipient(s), including name (max 90 characters)
      - Ensure "how" and "focus" content is not too similar
      - Provide CSS gradients for light and dark modes for How, Focus, and Who cards
      - Ensure gradients work well in both light and dark modes
      - For dark mode, use toned colors, not too bright or vibrant
      - For light mode, use more vibrant and bright colors
      - Make sure the three gradients are visually cohesive

    3. Metrics:
      - Include 4-5 metrics with short labels and numeric values
      - Focus on progress and impact, not budget or community votes
      - Extract interesting numeric data if lacking specific metrics

    4. Builder Card:
      - Bio: 2-3 paragraphs, each 130 characters or less, separated by "\n\n" (400 characters total max)
      - Social Links: Include platform name, URL, and icon name from the "icon_names" data set
      - Tags: Provide 3 tags, each max 15 characters

    5. Media:
      - Include 4-5 media items (images) with URL
      - Choose visually appealing images that showcase the grant and builder
      - Avoid using the same photos used in other cards
      - Prefer real-world photos over screenshots or text-heavy images

    6. Plan/Roadmap:
      - Provide 3 or 6 items with short headlines and brief descriptions (20-25 words)
      - Use information from grant description, stories, and casts

    7. Timeline:
      - Include significant events with dates and descriptions
      - Use information from grant description, stories, and casts

    8. Dynamic Cards:
      - Create 4, 7, or 11 cards as needed
      - Each card should have a title, short description (20-25 words), and icon name from the "icon_names" data set
      - Focus on unique aspects not covered in other sections, especially plan and roadmap
      - Ensure all important information is included

    Before finalizing the JSON object, review it to ensure all required fields are present and properly formatted. If any fields are missing or incomplete, address them before outputting the final JSON.

    Remember:
  - Use ONLY icon names included in the "icon_names" data set.
    - Include all important information from the grant description and stories.
    - Keep text impactful, easy to read, and understand.
    - Maintain a balance between formal and engaging language.
    - Choose visually appealing images that showcase the grant and builder.

    Ensure that your final JSON object adheres to this structure and includes all required fields with appropriate content.`,
    maxTokens: 5000,
    temperature: 0.5,
    maxRetries: 3,
  })

  console.debug(result.warnings)

  return result.object
}
