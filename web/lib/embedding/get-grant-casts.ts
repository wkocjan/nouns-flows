"use server"

import { farcasterDb } from "@/lib/database/farcaster"
import { embeddingsDb } from "./db"
import { embeddings } from "./schema"
import { getFarcasterUsersByEthAddresses, getFarcasterUsersByFids } from "../farcaster/get-user"
import { Cast, Profile } from "@prisma/farcaster"
import { and, arrayOverlaps, desc, eq } from "drizzle-orm"

export async function getGrantCasts({
  content,
  team,
  grantId,
  parentGrantContract,
}: {
  content: string
  team: string[]
  grantId: string
  parentGrantContract: string
}) {
  try {
    // Get Farcaster FIDs for the team members
    const farcasterUsers = await getFarcasterUsersByEthAddresses(team as `0x${string}`[])
    const fids = farcasterUsers.map((user) => user.fid.toString())
    const users = team.concat(fids)

    // Query embeddings DB for casts tagged with this grant and authored by team
    const results = await embeddingsDb
      .select({
        external_id: embeddings.external_id,
      })
      .from(embeddings)
      .where(
        and(
          eq(embeddings.type, "cast"),
          arrayOverlaps(embeddings.users, users),
          arrayOverlaps(embeddings.tags, [grantId]),
        ),
      )
      .orderBy(desc(embeddings.created_at))

    const externalIds = results
      .map((result) => result.external_id?.replace(/^0x/, ""))
      .filter((id): id is string => id !== null)

    const casts = await getCastsFromDb(externalIds)
    const castsWithMentions = await Promise.all(casts.map(processCastMentions))

    return castsWithMentions
  } catch (error) {
    console.error("Error in getGrantCasts:", error)
    throw new Error((error as Error).message || "Failed to get grant casts")
  }
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
