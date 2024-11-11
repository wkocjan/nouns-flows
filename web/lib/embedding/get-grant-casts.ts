"use server"

import { farcasterDb } from "@/lib/database/farcaster"
import { queryEmbeddingsSimilarity } from "./query"
import { getFarcasterUsersByEthAddresses, getFarcasterUsersByFids } from "../farcaster/get-user"
import { generateGrantEmbeddingForUpdates } from "./get-or-generate-grant-embedding"
import { Cast, Profile } from "@prisma/farcaster"

export async function getGrantCasts({
  content,
  team,
  grantId,
}: {
  content: string
  team: string[]
  grantId: string
}) {
  try {
    const embedding = await generateGrantEmbeddingForUpdates(content, grantId)
    if (!embedding) {
      throw new Error("Failed to generate grant embedding")
    }

    const teamFids = await getTeamFids(team)
    const externalIds = await getSimilarCasts(embedding, teamFids)
    const casts = await getCastsFromDb(externalIds)
    const castsWithMentions = await Promise.all(casts.map(processCastMentions))

    return castsWithMentions
  } catch (error) {
    console.error("Error in getGrantCasts:", error)
    throw new Error((error as Error).message || "Failed to get grant casts")
  }
}

async function getTeamFids(team: string[]) {
  const users = await getFarcasterUsersByEthAddresses(team as `0x${string}`[])
  return team.concat(users.map((user) => user.fid.toString()))
}

async function getSimilarCasts(embedding: number[], teamFids: string[]) {
  const results = await queryEmbeddingsSimilarity({
    embeddingQuery: embedding,
    types: ["cast"],
    users: teamFids,
    similarityCutoff: 0.3,
    numResults: 100,
  })

  return results
    .map((result) => result.externalId?.replace(/^0x/, ""))
    .filter((id): id is string => id !== null)
}

async function getCastsFromDb(externalIds: string[]): Promise<(Cast & { profile: Profile })[]> {
  return await farcasterDb.cast.findMany({
    where: {
      hash: {
        in: externalIds.map((id) => Buffer.from(id, "hex")),
      },
      parent_hash: null,
      deleted_at: null,
      created_at: {
        gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
      },
    },
    include: {
      profile: true,
    },
    orderBy: {
      created_at: "desc",
    },
    cacheStrategy: { swr: 600 },
  })
}

async function processCastMentions(cast: Cast & { profile: Profile }) {
  try {
    const mentions = JSON.parse(cast.mentions || "[]") as bigint[]
    if (!mentions.length) return cast

    const mentionedUsers = await getFarcasterUsersByFids(mentions)
    const mentionsMap = new Map(mentionedUsers.map((user) => [user.fid.toString(), user]))
    const positions = JSON.parse(cast.mentions_positions || "[]") as number[]
    let text = cast.text || ""

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
}
