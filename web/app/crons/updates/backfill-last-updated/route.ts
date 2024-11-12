import "server-only"
import { NextResponse } from "next/server"
import database from "@/lib/database"
import { embeddingsDb } from "@/lib/embedding/db"
import { embeddings } from "@/lib/embedding/schema"
import { and, arrayOverlaps, desc, eq } from "drizzle-orm"
import { getFarcasterUsersByEthAddresses } from "@/lib/farcaster/get-user"
import { FLOWS_CHANNEL_URL, NOUNS_CHANNEL_URL } from "@/lib/config"
import { farcasterDb } from "@/lib/database/farcaster"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 300

async function getFarcasterUsersForGrant(recipient: string) {
  const farcasterUsers = await getFarcasterUsersByEthAddresses([recipient as `0x${string}`])
  const fids = farcasterUsers.map((user) => user.fid.toString())
  return {
    users: [recipient.toLowerCase(), ...fids],
  }
}
async function getLatestCast(users: string[], grantId: string) {
  const embeddingCasts = await embeddingsDb
    .select({
      external_id: embeddings.external_id,
      created_at: embeddings.created_at,
    })
    .from(embeddings)
    .where(
      and(
        eq(embeddings.type, "cast"),
        arrayOverlaps(embeddings.users, users),
        arrayOverlaps(embeddings.groups, [NOUNS_CHANNEL_URL, FLOWS_CHANNEL_URL]),
        arrayOverlaps(embeddings.tags, [grantId]),
      ),
    )
    .orderBy((t) => desc(t.created_at))
    .limit(20)

  // log query
  console.log({
    embeddingCasts,
  })

  if (!embeddingCasts.length) {
    return []
  }

  const castIds = embeddingCasts
    .map((cast) => cast.external_id)
    .filter((id): id is string => !!id)
    .map((id) => Buffer.from(id.replace("0x", ""), "hex"))

  const farcasterCasts = await farcasterDb.cast.findMany({
    where: {
      hash: {
        in: castIds,
      },
    },
    select: {
      created_at: true,
    },
    orderBy: {
      created_at: "desc",
    },
  })

  if (!farcasterCasts.length) {
    throw new Error(`No casts found for external IDs: ${castIds.join(", ")}`)
  }

  return [{ created_at: farcasterCasts[0].created_at }]
}

export async function GET() {
  try {
    const grants = await database.grant.findMany({
      where: {
        isFlow: 0,
        isTopLevel: 0,
      },
      include: {
        derivedData: true,
      },
    })

    let updatedCount = 0

    for (const grant of grants) {
      const { users } = await getFarcasterUsersForGrant(grant.recipient)
      console.log({ users })
      const latestCasts = await getLatestCast(users, grant.id)
      const lastUpdate = latestCasts[0]?.created_at

      if (!lastUpdate) {
        console.log(`No cast found for grant ${grant.id}`)
        continue
      }

      // Create or update derivedData
      await database.derivedData.upsert({
        where: {
          grantId: grant.id,
        },
        create: {
          grantId: grant.id,
          lastBuilderUpdate: lastUpdate,
        },
        update: {
          lastBuilderUpdate: lastUpdate,
        },
      })
      updatedCount++

      // Add small delay between processing grants
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return NextResponse.json({
      success: true,
      updatedGrants: updatedCount,
    })
  } catch (error: any) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }
}
