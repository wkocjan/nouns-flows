"use server"

import { validTypes } from "@/lib/types/job"
import { z } from "zod"
import { generateEmbedding } from "./generate-embeddings"
import { embeddingsDb } from "@/lib/embedding/db"
import { embeddings } from "@/lib/embedding/schema"
import { sql, desc, cosineDistance, gt, and, eq } from "drizzle-orm"

const embeddingQuerySchema = z.object({
  type: z.enum(validTypes),
  query: z.string().trim().min(10, "Substantial query is required"),
  groups: z.array(z.string().trim()),
  users: z.array(
    z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid user address"),
  ),
  tags: z.array(z.string().trim()),
})

export async function queryEmbeddings({
  type,
  query,
  groups,
  users,
  tags,
}: z.infer<typeof embeddingQuerySchema>) {
  try {
    const validation = embeddingQuerySchema.safeParse({
      type,
      query,
      groups,
      users,
      tags,
    })

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      throw new Error(Object.values(errors).flat().join(", "))
    }

    const embedding = await generateEmbedding(query)
    const vectorQuery = `[${embedding.join(",")}]`

    const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, vectorQuery)})`

    console.debug(`Here we go: ${type}, query: ${query}, users: ${users}`)
    const results = await embeddingsDb
      .select({
        id: embeddings.id,
        content: embeddings.content,
        similarity,
        type: embeddings.type,
        groups: embeddings.groups,
        users: embeddings.users,
        tags: embeddings.tags,
      })
      .from(embeddings)
      .where(and(gt(similarity, 0.3), eq(embeddings.type, type)))
      .orderBy((t) => desc(t.similarity))
      .limit(5)

    return results
  } catch (error) {
    console.error(error)
    return (error as Error).message
  }
}
