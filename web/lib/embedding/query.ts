import { embeddingsDb } from "./db"
import { embeddings } from "./schema"
import { validTypes } from "@/lib/types/job"
import { and, arrayOverlaps, cosineDistance, desc, gt, inArray, sql } from "drizzle-orm"

type QueryParams = {
  types: (typeof validTypes)[number][]
  groups?: string[]
  users?: string[]
  tags?: string[]
  numResults?: number
}

async function queryEmbeddingsWithoutSimilarity({
  types,
  groups = [],
  users = [],
  tags = [],
  numResults = 10,
}: QueryParams) {
  return await embeddingsDb
    .select({
      id: embeddings.id,
      content: embeddings.content,
      similarity: sql<number>`1`, // Default similarity of 1 when not doing vector search
      type: embeddings.type,
      groups: embeddings.groups,
      users: embeddings.users,
      tags: embeddings.tags,
      external_id: embeddings.external_id,
    })
    .from(embeddings)
    .where(getWhereClause({ types, groups, users, tags }))
    .limit(numResults)
}

function getWhereClause({ types, groups = [], users = [], tags = [] }: QueryParams) {
  return and(
    // If types array is provided, require matching type
    ...(types.length > 0 ? [inArray(embeddings.type, types)] : []),
    // If tags array is provided, require matching tags
    ...(tags.length > 0 ? [arrayOverlaps(embeddings.tags, tags)] : []),
    // If users array is provided, require matching users
    ...(users.length > 0 ? [arrayOverlaps(embeddings.users, users)] : []),
    // If groups array is provided, require matching groups
    ...(groups.length > 0 ? [arrayOverlaps(embeddings.groups, groups)] : []),
  )
}

export async function queryEmbeddingsSimilarity({
  embeddingQuery,
  types,
  groups = [],
  users = [],
  tags = [],
  numResults = 10,
  similarityCutoff = 0.2,
}: QueryParams & {
  embeddingQuery: number[] | null
  similarityCutoff?: number
}) {
  if (!embeddingQuery) {
    return queryEmbeddingsWithoutSimilarity({
      types,
      groups,
      users,
      tags,
      numResults,
    })
  }

  const vectorQuery = `[${embeddingQuery.join(",")}]`
  const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, vectorQuery)})`

  return await embeddingsDb
    .select({
      id: embeddings.id,
      content: embeddings.content,
      similarity,
      type: embeddings.type,
      groups: embeddings.groups,
      users: embeddings.users,
      tags: embeddings.tags,
      external_id: embeddings.external_id,
    })
    .from(embeddings)
    .where(and(gt(similarity, similarityCutoff), getWhereClause({ types, groups, users, tags })))
    .orderBy((t) => desc(t.similarity))
    .limit(numResults)
}
