"use server"

import { generateEmbedding } from "./generate-embedding"
import { openai } from "../ai/providers/openai"
import database from "../database"

const getEnhancedContent = async (content: string, programRequirements: string) => {
  const enhancedContent = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are to generate potential social media updates that the grant team might post about their work.
Based on the grant details provided, produce several example updates that are specific about the grant's focus area and the work being done.
Your goal is to include different ways the grant team might describe their work, incorporating common phrases, keywords, and terms related to the grant.
Do not include any markdown formatting; provide plain text.
Do not state that you are generating examples; just return the text.
Do not include anything about the builder or their experience.
The updates should be as if posted by the grant team themselves, not by others.
Include as many variations as needed to enhance semantic search matching.`,
      },
      {
        role: "user",
        content: `Please generate several example social media updates that the grant team might post about their grant ${content} in the grant budget: ${content}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 600,
  })

  return enhancedContent.choices[0].message.content
}

export const generateGrantEmbeddingForUpdates = async (
  content: string,
  grantId: string,
  parentGrantContract: string,
) => {
  try {
    // Try to get existing derived data first
    const existingData = await database.derivedData.findUnique({
      where: { grantId },
      select: { updatesEmbeddingText: true },
      cacheStrategy: { ttl: 172800 }, // 2 days in seconds
    })

    const programRequirements = await getProgramRequirements(parentGrantContract)

    if (existingData?.updatesEmbeddingText) {
      // If we have existing text, generate embedding from that
      return await generateEmbedding(existingData.updatesEmbeddingText)
    }

    // If no existing data, enhance content and generate new embedding
    const enhancedText = await getEnhancedContent(content, programRequirements)
    console.log({ content, enhancedText })

    const embedding = await generateEmbedding(
      `Requirements: ${programRequirements} - Grant: ${content} - Potential Updates: ${enhancedText}`,
    )

    // Save the enhanced text to DerivedData
    await database.derivedData.upsert({
      where: { grantId },
      create: {
        grantId,
        updatesEmbeddingText: enhancedText,
      },
      update: {
        updatesEmbeddingText: enhancedText,
      },
    })

    return embedding
  } catch (error) {
    console.error("Error in generateGrantEmbeddingForUpdates:", error)
    throw new Error((error as Error).message || "Failed to generate grant embedding")
  }
}

const getProgramRequirements = async (parentGrantContract: string) => {
  const parentGrant = await database.grant.findFirst({
    where: { recipient: parentGrantContract },
    select: { description: true },
    cacheStrategy: { ttl: 172800 }, // 2 days in seconds
  })

  return parentGrant?.description ?? ""
}
