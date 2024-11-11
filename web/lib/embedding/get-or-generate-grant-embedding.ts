"use server"

import { embeddingsDb } from "./db"
import { embeddings } from "./schema"
import { eq, and } from "drizzle-orm"
import { generateEmbedding } from "./generate-embedding"

export async function getOrGenerateGrantEmbedding(grantId: string, content: string) {
  try {
    // First try to find existing embedding
    const existingEmbedding = await embeddingsDb
      .select()
      .from(embeddings)
      .where(and(eq(embeddings.type, "grant"), eq(embeddings.externalId, grantId)))
      .limit(1)

    if (existingEmbedding.length > 0) {
      return existingEmbedding[0].embedding
    }

    // Generate new embedding if not found
    const embedding = await generateEmbedding(content)
    return embedding
  } catch (error) {
    console.error("Error in getOrGenerateGrantEmbedding:", error)
    throw new Error((error as Error).message || "Failed to get or generate grant embedding")
  }
}
