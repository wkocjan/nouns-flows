"use server"

import { farcasterDb } from "@/lib/database/farcaster-edge"
import { getFarcasterUsersByFids } from "../farcaster/get-user"
import { Cast, Profile } from "@prisma/farcaster"
import { getCacheStrategy } from "../database/edge"

export async function getGrantCasts({ grantId }: { grantId: string }) {
  try {
    const casts = await getCastsFromDb(grantId)
    const castsWithMentions = await Promise.all(casts.map(processCastMentions))

    return castsWithMentions
  } catch (error) {
    console.error("Error in getGrantCasts:", error)
    throw new Error((error as Error).message || "Failed to get grant casts")
  }
}

async function getCastsFromDb(grantId: string): Promise<(Cast & { profile: Profile })[]> {
  return await farcasterDb.cast.findMany({
    where: {
      computed_tags: {
        has: grantId,
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
    take: 50,
    ...getCacheStrategy(600),
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
