"use server"

import { openai } from "@/lib/ai/providers/openai"
import { cleanTextForEmbedding } from "./utils"
import { unstable_cache } from "next/cache"

export async function generateEmbedding(content: string): Promise<number[]> {
  try {
    const response = await unstable_cache(
      async () => {
        return await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: cleanTextForEmbedding(content),
        })
      },
      undefined,
      { revalidate: 60 * 60 * 24 * 7 }, // 1 week in seconds
    )()

    return response.data[0].embedding
  } catch (error) {
    console.error(error)
    throw new Error((error as Error).message || "Failed to generate embedding")
  }
}
