"use server"

import { farcasterDb } from "@/lib/database/farcaster"
import { queryEmbeddingsSimilarity } from "./query"
import { getFarcasterUsersByEthAddresses, getFarcasterUsersByFids } from "../farcaster/get-user"
import { getOrGenerateGrantEmbedding } from "./get-or-generate-grant-embedding"

export async function getGrantCasts({
  grantId,
  content,
  team,
}: {
  grantId: string
  content: string
  team: string[]
}) {
  try {
    // Generate embedding from grant content
    const embedding = await getOrGenerateGrantEmbedding(grantId, content)
    if (!embedding) {
      throw new Error("Failed to generate grant embedding")
    }

    const users = await getFarcasterUsersByEthAddresses(team as `0x${string}`[])

    // Query for similar casts
    const results = await queryEmbeddingsSimilarity({
      embeddingQuery: embedding,
      types: ["cast"],
      users: team.concat(users.map((user) => user.fid.toString())),
      similarityCutoff: 0.2,
      numResults: 100,
    })

    // Extract external IDs from results and remove 0x prefix if present
    const externalIds = results
      .map((result) => result.externalId?.replace(/^0x/, ""))
      .filter((id): id is string => id !== null)

    // Query Farcaster DB for full cast details with users using relation
    const casts = await farcasterDb.cast.findMany({
      where: {
        hash: {
          in: externalIds.map((id) => Buffer.from(id, "hex")),
        },
        parent_hash: null,
        deleted_at: null,
      },
      include: {
        profile: true,
      },
      orderBy: {
        created_at: "desc",
      },
      cacheStrategy: { swr: 600 },
    })

    // Get mentioned users and merge with casts
    const castsWithMentions = await Promise.all(
      casts.map(async (cast) => {
        try {
          const mentions = JSON.parse(cast.mentions || "[]") as bigint[]
          if (!mentions.length) return cast

          const mentionedUsers = await getFarcasterUsersByFids(mentions)
          const mentionsMap = new Map(mentionedUsers.map((user) => [user.fid.toString(), user]))

          // Insert mentions into text at correct positions
          const positions = JSON.parse(cast.mentions_positions || "[]") as number[]
          let text = cast.text || ""

          // Process mentions in reverse order to not affect subsequent position indices
          for (let i = mentions.length - 1; i >= 0; i--) {
            const user = mentionsMap.get(mentions[i].toString())
            if (user && positions[i] !== undefined) {
              const before = text.slice(0, positions[i])
              const after = text.slice(positions[i])
              text = before + "@" + user.fname + after
            }
          }

          return {
            ...cast,
            text,
            mentionedProfiles: mentionedUsers,
          }
        } catch (e) {
          console.error("Error processing mentions for cast:", e)
          return cast
        }
      }),
    )

    return castsWithMentions
  } catch (error) {
    console.error("Error in getGrantCasts:", error)
    throw new Error((error as Error).message || "Failed to get grant casts")
  }
}
