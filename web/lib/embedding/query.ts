import { embeddingsDb } from "./db"
import { embeddings } from "./schema"
import { validTypes } from "@/lib/types/job"
import { and, arrayOverlaps, cosineDistance, desc, gt, inArray, or, sql } from "drizzle-orm"

export async function queryEmbeddingsSimilarity({
  embeddingQuery,
  types,
  groups = [],
  users = [],
  tags = [],
  numResults = 10,
  similarityCutoff = 0.25,
}: {
  embeddingQuery: number[]
  types: (typeof validTypes)[number][]
  groups?: string[]
  users?: string[]
  tags?: string[]
  numResults?: number
  similarityCutoff?: number
}) {
  const vectorQuery = `[${embeddingQuery.join(",")}]`
  const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, vectorQuery)})`

  console.log({ types, tags, users, groups })

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
        gt(similarity, similarityCutoff),
        // If types array is provided, require matching type
        ...(types.length > 0 ? [inArray(embeddings.type, types)] : []),
        // If tags array is provided, require matching tags
        ...(tags.length > 0 ? [arrayOverlaps(embeddings.tags, tags)] : []),
        // If users array is provided, require matching users
        ...(users.length > 0 ? [arrayOverlaps(embeddings.users, users)] : []),
        // If groups array is provided, require matching groups
        ...(groups.length > 0 ? [arrayOverlaps(embeddings.groups, groups)] : []),
      ),
    )
    .orderBy((t) => desc(t.similarity))
    .limit(numResults)

  return results
}
