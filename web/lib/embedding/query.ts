import { embeddingsDb } from "./db"
import { embeddings } from "./schema"
import { validTypes } from "@/lib/types/job"
import { and, arrayOverlaps, asc, desc, inArray, sql } from "drizzle-orm"

type QueryParams = {
  types: (typeof validTypes)[number][]
  groups?: string[]
  users?: string[]
  tags?: string[]
  numResults?: number
  orderBy?: "similarity" | "created_at"
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
  orderBy = "similarity",
}: QueryParams & {
  embeddingQuery: number[] | null
  similarityCutoff?: number
}) {
  try {
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
    const distanceExpr = sql<number>`(embeddings.embedding <=> ${vectorQuery}::vector)`

    return await embeddingsDb
      .select({
        id: embeddings.id,
        content: embeddings.content,
        type: embeddings.type,
        groups: embeddings.groups,
        users: embeddings.users,
        tags: embeddings.tags,
        external_id: embeddings.external_id,
        external_url: embeddings.external_url,
        url_summaries: embeddings.url_summaries,
      })
      .from(embeddings)
      .where(getWhereClause({ types, groups, users, tags }))
      .orderBy(orderBy === "similarity" ? asc(distanceExpr) : desc(embeddings.created_at))
      .limit(numResults)
  } catch (error) {
    console.error(error)
    throw new Error((error as Error).message || "Failed to query embeddings")
  }
}
