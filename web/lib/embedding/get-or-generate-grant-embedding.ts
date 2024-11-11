"use server"

import { generateEmbedding } from "./generate-embedding"
import { openai } from "../ai/providers/openai"
import database from "../database"

const getEnhancedContent = async (content: string) => {
  const enhancedContent = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are generating text that will match embeddings for social media updates about this grant.
          Analyze the grant details and generate a paragraph of text that will help with embedding matching for the grant.
          Keep the text generic enough to match real posts but relevant to the grant's focus area.
          Do not include any markdown formatting, make it a paragraph or two of text.
          Do not state that you are generating a prediction or summary, just return the text that will help with embedding matching.
          Do not say things might be shared, just return the text that will help with embedding matching.
          Do not include anything about the builder or their experience.
          The updates being matched on will be posted by the grant team, not other random people on social media.
          Be specific about what updates might be posted based on what the grant is for and what work is being done or expected of the grant team.
          Include more examples than you think you need to ensure the embedding can be found by semantic search.`,
      },
      {
        role: "user",
        content: `Please generate a paragraph of text that will help with embedding matching for the grant: ${content}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 600,
  })

  return enhancedContent.choices[0].message.content || content
}

export const generateGrantEmbeddingForUpdates = async (content: string, grantId: string) => {
  try {
    // Enhance content with additional context for better embedding matching
    const enhancedText = await getEnhancedContent(content)
    console.log({ content, enhancedText })

    // Generate new embedding if not found
    const embedding = await generateEmbedding(enhancedText)

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
