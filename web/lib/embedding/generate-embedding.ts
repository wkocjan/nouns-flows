"use server"

import { openai } from "@/lib/ai/providers/openai"
import { cleanTextForEmbedding } from "./utils"

export async function generateEmbedding(content: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: cleanTextForEmbedding(content),
    })

    return response.data[0].embedding
  } catch (error) {
    console.error(error)
    throw new Error((error as Error).message || "Failed to generate embedding")
  }
}
