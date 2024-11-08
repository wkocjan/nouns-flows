"use server"

import { embeddingsDb } from "@/lib/embedding/db"
import { embeddings } from "@/lib/embedding/schema"
import { validTypes } from "@/lib/types/job"
import { and, arrayOverlaps, cosineDistance, desc, gt, inArray, or, sql } from "drizzle-orm"
import { z } from "zod"
import { generateEmbedding } from "./generate-embedding"

const embeddingQuerySchema = z.object({
  types: z.array(z.enum(validTypes)),
  query: z.string().trim().min(10, "Substantial query is required"),
  groups: z.array(z.string().trim()),
  users: z
    .array(
      z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid user address"),
    )
    .optional(),
  tags: z.array(z.string().trim()),
  numResults: z.number().min(1).max(100),
})

export async function searchEmbeddings({
  types,
  query,
  groups,
  users,
  tags,
  numResults,
}: z.infer<typeof embeddingQuerySchema>) {
  try {
    const validation = embeddingQuerySchema.safeParse({
      types,
      query,
      groups,
      users,
      tags,
      numResults,
    })

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      throw new Error(Object.values(errors).flat().join(", "))
    }

    const embedding = await generateEmbedding(query)
    const vectorQuery = `[${embedding.join(",")}]`

    const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, vectorQuery)})`

    const results = await embeddingsDb
      .select({
        id: embeddings.id,
        content: embeddings.content,
        similarity,
        type: embeddings.type,
        groups: embeddings.groups,
        users: embeddings.users,
        tags: embeddings.tags,
        externalId: embeddings.externalId,
      })
      .from(embeddings)
      .where(
        and(
          gt(similarity, 0.25),
          or(
            types.length > 0 ? inArray(embeddings.type, types) : undefined,
            tags.length > 0 ? arrayOverlaps(embeddings.tags, tags) : undefined,
            users && users.length > 0 ? arrayOverlaps(embeddings.users, users) : undefined,
          ),
        ),
      )
      .orderBy((t) => desc(t.similarity))
      .limit(numResults)

    return results
  } catch (error) {
    console.error(error)
    return (error as Error).message
  }
}
