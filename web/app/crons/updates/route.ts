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
import { farcasterDb } from "@/lib/database/farcaster"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 300

const KV_KEY = "last-analyzed-cast-time-v3"

async function getFarcasterUsersForGrant(recipient: string) {
  const farcasterUsers = await getFarcasterUsersByEthAddresses([recipient as `0x${string}`])
  const fids = farcasterUsers.map((user) => user.fid.toString())

  const ethAddressToFid = farcasterUsers.reduce(
    (acc, user) => {
      for (const address of user.verified_addresses) {
        acc[address.toLowerCase() as `0x${string}`] = user.fid.toString()
      }
      return acc
    },
    {} as Record<`0x${string}`, string>,
  )

  return {
    fids,
    ethAddressToFid,
    users: [recipient.toLowerCase(), ...fids],
  }
}

async function getRecentCasts(users: string[], lastAnalyzedDate: Date) {
  return embeddingsDb
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
}

async function updateCastTags(cast: any, grantId: string) {
  const newTags = new Set([...(cast.tags || []), grantId])
  await embeddingsDb
    .update(embeddings)
    .set({
      tags: Array.from(newTags),
    })
    .where(eq(embeddings.id, cast.id))
}

export async function GET() {
  try {
    const grants = await database.grant.findMany({
      where: {
        isFlow: 0,
        isTopLevel: 0,
      },
      include: { flow: true },
    })

    let analyzedCastsTotal = 0

    // Process one grant at a time
    for (const grant of grants) {
      const lastAnalyzedDate = new Date((await getItem<string>(`${KV_KEY}:${grant.id}`)) || "0")
      const { users, ethAddressToFid } = await getFarcasterUsersForGrant(grant.recipient)

      console.log({ grant: grant.id, users, lastAnalyzedDate })

      const casts = await getRecentCasts(users, lastAnalyzedDate)
      console.log(`Found ${casts.length} casts to analyze for grant ${grant.id}`)

      for (const cast of casts) {
        if (!cast.created_at) continue
        const { grantId, isGrantUpdate, reason, confidenceScore } = await analyzeCast(
          cast,
          [grant].filter(
            (g) =>
              cast.users?.includes(g.recipient.toLowerCase()) ||
              cast.users?.includes(ethAddressToFid[g.recipient.toLowerCase() as `0x${string}`]),
          ),
        )

        console.debug({ text: cast.content, isGrantUpdate, reason, confidenceScore, grantId })
        if (isGrantUpdate && grantId && cast.external_id) {
          await updateCastTags(cast, grantId)
          await updateLastBuilderUpdate(cast.external_id, grantId)
        }

        await new Promise((resolve) => setTimeout(resolve, 250))
      }

      if (grant.id) {
        const newDate =
          casts[casts.length - 1]?.created_at?.toISOString() || new Date().toISOString()
        console.log(`Saving last analyzed cast time for grant ${grant.id} and cast`, newDate)
        // add 0.5 seconds to the date to avoid duplicates
        await saveItem(`${KV_KEY}:${grant.id}`, new Date(newDate).getTime() + 500)
      }

      analyzedCastsTotal += casts.length
    }

    return NextResponse.json({ success: true, analyzedCasts: analyzedCastsTotal })
  } catch (error: any) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }
}

async function updateLastBuilderUpdate(castExternalId: string, grantId: string) {
  // Get the actual cast from Farcaster DB
  const farcasterCast = await farcasterDb.cast.findFirst({
    where: {
      hash: Buffer.from(castExternalId.replace("0x", ""), "hex"),
    },
    select: {
      created_at: true,
    },
  })

  if (!farcasterCast) {
    throw new Error(`Cast not found for external ID: ${castExternalId}`)
  }

  if (farcasterCast.created_at) {
    // Update the derived data with the latest builder update
    await database.derivedData.upsert({
      where: {
        grantId: grantId,
      },
      create: {
        grantId: grantId,
        lastBuilderUpdate: farcasterCast.created_at,
      },
      update: {
        lastBuilderUpdate: farcasterCast.created_at,
      },
    })
  }
}
