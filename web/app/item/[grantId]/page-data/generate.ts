import "server-only"

import { getAgent } from "@/lib/ai/agents/agent"
import { anthropic } from "@/lib/ai/providers/anthropic"
import database from "@/lib/database/edge"
import { farcasterDb } from "@/lib/database/farcaster-edge"
import { generateObject, generateText } from "ai"
import dynamicIconImports from "lucide-react/dynamicIconImports"
import { GrantPageData, grantPageSchema } from "./schema"

export async function generateGrantPageData(id: string): Promise<GrantPageData | null> {
  const [{ flow, ...grant }, stories, casts, storiesCount, castsCount] = await Promise.all([
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
    database.story.count({ where: { grant_ids: { has: id } } }),
    farcasterDb.cast.count({ where: { computed_tags: { has: id } } }),
  ])

  const iconNames = Object.keys(dynamicIconImports)

  const agent = await getAgent("flo", { grantId: id, address: grant.recipient })

  const result = await generateText({
    model: anthropic("claude-3-5-sonnet-latest"),
    system: agent.prompt,
    prompt: `You are an experienced data analyst and project manager specializing in web3 projects. Your task is to analyze grant information, related stories, casts and recipient details to create a structured and informative grant page data.

    Do not use any tools available to you. Just analyze the data you are given.

    Here is the data you will analyze:

    ----
    Grant Data:
    ${JSON.stringify(grant)}
    ----
    Flow Data:
    ${JSON.stringify(flow)}
    ----
    Stories Data:
    ${JSON.stringify(stories)}
    ----
    Casts Data:
    ${JSON.stringify(casts)}
    ----
    Stories Count (about this grant):
    ${storiesCount}
    ----
    Casts Count (about this grant):
    ${castsCount}
    ----
    
    Conduct a thorough analysis of the provided data, following these steps:

    1. Grant Data Analysis:
      - Extract key information from the grant's description (it comes in markdown format).
      - List the grant's main objectives.
      - Extract other relevant details about the grant and builder(s).

    2. Flow Data Analysis:
      - Explain how the grant fits into the category and its goals (flow).
      - Identify any dependencies or connections with other projects in the flow.

    3. Stories Data Analysis:
      - Summarize important points about the grant's progress.
      - List significant milestones achieved, with dates if available.
      - For each story, provide a brief summary and note significant events, achievements, or challenges.
      - Identify common themes or patterns across the stories.
      - List all images from the stories.

    4. Casts Data Analysis:
      - Extract any additional context not covered in the grant description or stories.
      - Note any recurring topics or concerns mentioned in the casts.

    5. Cross-referencing:
      - Identify information that appears in multiple data sources.
      - Note any discrepancies or contradictions between different sources.

    Once you understand all the data, create content for the grant page. Here is the structure you need to follow with some additional instructions:

    ### Title
    Structure:
    <title>{title}</title>

    Instructions:
    - Shorten if very long, use normal case
    
    ### Tagline
    Structure:
    <tagline>{tagline}</tagline>

    Instructions:
    - Use grant tagline or generate based on description

    ### Cover Image
    Structure:
    <coverImage>
      <url>{url}</url>
      <position>{position}</position>
      <alt>{alt}</alt>
    </coverImage>

    Instructions:
    - Provide URL of the most relevant image, defaulting to "grant.image" field if unsure
    - For "position" provide vertical position of the focal point or main subject in the image. It can be "top", "center" or "bottom".
  
    ### Why
    Structure:
    <why>
      <text>{why}</text>
      <image>{image}</image>
    </why>

    Instructions:
    - One sentence explaining the grant's main goal (max 10 words)
    - Provide URL of the image that will be used in the background. Ideally it's different from the cover image.
    
    ### How
    Structure:
    <how>{how}</how>

    Instructions:
    - Explain how the goal will be achieved
    - Max 120 characters (including spaces)
    
    ### Who
    Structure:
    <who>{who}</who>

    Instructions:
    - Short introduction of grant recipient(s), including name
    - If there are multiple recipients, mention them all
    - Max 80 characters (including spaces)
    
    ### Focus
    Structure:
    <focus>{focus}</focus>

    Instructions:
    - Describe what's the current focus of builder(s) in context of the grant
    - Ensure is not too similar to "how" section
    - Max 90 characters (including spaces)
    
    ### Metrics
    Structure:
    <metrics>
      <metric> # Repeat for each metric
        <label>{label}</label>
        <value>{value}</value>
      </metric>
    </metrics>

    Instructions:
    - Include 4 or 5 metrics with short labels and numeric values
    - Focus on progress and impact, not budget or community votes
    - Extract interesting numeric data if lacking specific metrics
    - From the label it should be clear what the value means (what's the unit)
    
    ### Builder
    Structure:
    <builder>
      <bio>{bio}</bio>
      <links>
        <link> # Repeat for each link
          <title>{title}</title>
          <url>{url}</url>
        </link>
      </links>
      <tags>{tags}</tags>
    </builder>

    Instructions:
    - Bio: 2-3 paragraphs, each 130 characters or less, separated by "\n\n" (400 characters total max)
    - Social Links: Include platform name and URL
    - Tags: Provide 3 tags, each max 15 characters. These tags should characterize the builder.
    - Bio can contain some information that is covered in other sections

    ### Media
    Structure:
    <media>
      <item> # Repeat for each item
        <url>{url}</url>
        <alt>{alt}</alt>
      </item>
    </media>

    Instructions:
    - Include 4 or 5 or 8 or 10  media items (images) with URL
    - Choose visually appealing images that showcase the grant and its impact
    - Avoid using the same photos used in other sections
    - Prefer real-world photos over screenshots or text-heavy images, posters, etc.
    
    ### Plan
    Structure:
    <plan>
      <item> # Repeat for each item
        <title>{title}</title>
        <description>{description}</description>
      </item>
    </plan>

    Instructions:
    - Provide 3 or 6 items with short headlines and brief descriptions (20-25 words)

    ### Timeline
    Structure:
    <timeline>
      <item> # Repeat for each item
        <date>{date}</date>
        <title>{title}</title>
      </item>
    </timeline>

    Instructions:
    - Include significant events with date and short copy (5-12 words)
    - Optimally include 4-7 items

    ### Dynamic Cards
    Structure:
    <cards>
      <item> # Repeat for each item
        <title>{title}</title>
        <description>{description}</description>
      </item>
    </cards>

    Instructions:
    - All other important information (not covered in other sections) should be included here
    - Create 4, 7, or 11 sections as needed
    - Each card should have a title and a short description (20-25 words)
    - Focus on unique aspects not covered in other sections, especially plan and roadmap
  
    ## Remember:
    - Include all important information from the grant description and stories.
    - Keep text impactful, easy to read, and understand.
    - Maintain a balance between formal and engaging language.
    - Choose visually appealing images that showcase the grant and builder.
        
    Once you are done, respond with just the structured text wrapped by <pageData> tags - it will be later transformed into JSON. Ensure all sections are present and that text lengths are within the specified limits.
    `,
    maxTokens: 5000,
    temperature: 0.5,
    maxRetries: 3,
  })

  if (!result.text) throw new Error("No text generated")

  console.debug("Got the text. Now generating JSON...", result.text)

  const { object } = await generateObject({
    model: anthropic("claude-3-5-sonnet-latest"),
    schema: grantPageSchema,
    system: `
    ## General instructions:
    You are an expert JSON data transformer. Your task is to:
    1. Take structured text input and convert it precisely into a JSON object
    2. Maintain all content exactly as provided without modifying or interpreting it
    3. Follow the provided schema structure strictly
    4. When needed, choose the icons for the sections (IMPORTANT: only from the provided dataset!)
    5. When needed, provide gradients for the sections

    Under any circumstances do not exclude any sections or information, nor modify provided URLs.

    You can only shorten text if it's absolutely necessary and it's over the provided limit in the schema.

    ## Gradients:
    Whenever generating gradients:
    - Provide CSS gradients for light and dark modes
    - For dark mode, use toned colors, not too bright or vibrant
    - For light mode, use more vibrant and bright colors

    ## Icons
    Whenever generating icons, choose name from the following dataset:    
    
    <icons>
    ${iconNames.join("\n")}
    </icons>

    !!! DO NOT use any icon name that is not listed in the dataset above !!!
    `,
    prompt: `
    Output the grant page data in JSON format based on the following text:
    ${result.text}

    Generate gradients and text color for "how", "focus" and "who" cards. Make sure these gradients are cohesive, but different from each other.
    `,
    maxTokens: 5000,
    temperature: 0,
    maxRetries: 3,
  })

  console.debug("Got the JSON object")

  return object
}
