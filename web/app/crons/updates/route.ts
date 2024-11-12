import "server-only"

import { getItem, saveItem } from "@/lib/kv/kvStore"
import { isProduction } from "@/lib/utils"
import { NextResponse } from "next/server"
import { analyzeCast } from "./analyze-cast"
import database from "@/lib/database"
import { embeddingsDb } from "@/lib/embedding/db"
import { embeddings } from "@/lib/embedding/schema"
import { and, arrayOverlaps, asc, eq, gt } from "drizzle-orm"
import { getFarcasterUsersByEthAddresses } from "@/lib/farcaster/get-user"
import { FLOWS_CHANNEL_URL, NOUNS_CHANNEL_URL } from "@/lib/config"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 300

const KV_KEY = "last-analyzed-cast-time-v2"
const BATCH_SIZE = 5

export async function GET() {
  try {
    const lastAnalyzedDate = new Date((await getItem<string>(KV_KEY)) || "0")

    console.debug("Analyzing casts after", lastAnalyzedDate)

    const grants = await database.grant.findMany({
      where: {
        isFlow: 0,
        isTopLevel: 0,
        id: "0xdc0fce4d61c950025f8757f33d2c1aea81f082e63d758daa37a7c75cf6f2b763",
      },
      include: { flow: true },
    })

    // Process grants in batches
    let analyzedCastsTotal = 0
    for (let i = 0; i < grants.length; i += BATCH_SIZE) {
      const grantsBatch = grants.slice(i, i + BATCH_SIZE)
      const recipients = Array.from(
        new Set(grantsBatch.map((grant) => grant.recipient.toLowerCase())),
      )

      // Get all Farcaster users associated with these addresses
      const farcasterUsers = await getFarcasterUsersByEthAddresses(recipients as `0x${string}`[])

      // Extract unique FIDs from the users
      const fids = Array.from(new Set(farcasterUsers.map((user) => user.fid.toString())))

      // mapping of eth address to fid
      const ethAddressToFid = farcasterUsers.reduce(
        (acc, user) => {
          for (const address of user.verified_addresses) {
            acc[address.toLowerCase() as `0x${string}`] = user.fid.toString()
          }
          return acc
        },
        {} as Record<`0x${string}`, string>,
      )

      const users = recipients.concat(fids)

      console.log({ batchNumber: Math.floor(i / BATCH_SIZE) + 1, users, lastAnalyzedDate })

      const casts = await embeddingsDb
        .select({
          id: embeddings.id,
          created_at: embeddings.created_at,
          type: embeddings.type,
          users: embeddings.users,
          groups: embeddings.groups,
          tags: embeddings.tags,
          content: embeddings.content,
          external_id: embeddings.external_id,
        })
        .from(embeddings)
        .where(
          and(
            gt(embeddings.created_at, lastAnalyzedDate),
            eq(embeddings.type, "cast"),
            arrayOverlaps(embeddings.users, users),
            arrayOverlaps(embeddings.groups, [NOUNS_CHANNEL_URL, FLOWS_CHANNEL_URL]),
          ),
        )
        .orderBy((t) => asc(t.created_at))
        .limit(isProduction() ? 30 : 100)

      // log # of casts
      console.log(
        `Found ${casts.length} casts to analyze in batch ${Math.floor(i / BATCH_SIZE) + 1}`,
      )

      for (const cast of casts) {
        if (!cast.created_at) continue
        const { grantId, isGrantUpdate, reason, confidenceScore } = await analyzeCast(
          cast,
          grantsBatch.filter(
            (g) =>
              cast.users?.includes(g.recipient.toLowerCase()) ||
              cast.users?.includes(ethAddressToFid[g.recipient.toLowerCase() as `0x${string}`]),
          ),
        )

        console.debug({ text: cast.content, isGrantUpdate, reason, confidenceScore, grantId })

        if (isGrantUpdate && grantId) {
          const newTags = new Set([...(cast.tags || []), grantId])
          await embeddingsDb
            .update(embeddings)
            .set({
              tags: Array.from(newTags),
            })
            .where(eq(embeddings.id, cast.id))
        }

        await saveItem(KV_KEY, cast.created_at.toISOString())

        await new Promise((resolve) => setTimeout(resolve, 250))
      }

      analyzedCastsTotal += casts.length
    }

    return NextResponse.json({ success: true, analyzedCasts: analyzedCastsTotal })
  } catch (error: any) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }
}
