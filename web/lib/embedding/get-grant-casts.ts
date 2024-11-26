"use server"

import { farcasterDb } from "@/lib/database/farcaster-edge"
import { getFarcasterUsersByFids } from "../farcaster/get-user"
import { Cast, Profile } from "@prisma/farcaster"
import { getCacheStrategy } from "../database/edge"
import { insertMentionsIntoText } from "../casts/cast-mentions"

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
  try {
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
  } catch (error) {
    console.error("Error fetching casts from DB:", error)
    return []
  }
}

async function processCastMentions(cast: Cast & { profile: Profile }) {
  try {
    const mentions = Array.isArray(cast.mentioned_fids)
      ? cast.mentioned_fids
      : (JSON.parse(cast.mentions || "[]") as bigint[])
    if (!mentions.length) return cast
    const mentionedUsers = await getFarcasterUsersByFids(mentions)
    const fidToFname = new Map(
      mentionedUsers.map((user) => [user.fid.toString(), user.fname || ""]),
    )

    const positions = Array.isArray(cast.mentions_positions_array)
      ? cast.mentions_positions_array
      : (JSON.parse(cast.mentions_positions || "[]") as number[])

    const text = insertMentionsIntoText(
      cast.text || "",
      positions,
      mentions.map(Number),
      fidToFname,
    )

    return {
      ...cast,
      text,
    }
  } catch (e) {
    console.error("Error processing mentions for cast:", e)
    return cast
  }
}
