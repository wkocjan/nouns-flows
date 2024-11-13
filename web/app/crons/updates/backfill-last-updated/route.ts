import "server-only"
import { NextResponse } from "next/server"
import database from "@/lib/database"
import { getFarcasterUsersByEthAddresses } from "@/lib/farcaster/get-user"
import { farcasterDb } from "@/lib/database/farcaster"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 300

async function getFarcasterUsersForGrant(recipient: string) {
  const farcasterUsers = await getFarcasterUsersByEthAddresses([recipient as `0x${string}`])
  return farcasterUsers
}

async function getLatestCast(grantId: string) {
  const casts = await farcasterDb.cast.findMany({
    where: {
      computed_tags: {
        has: grantId,
      },
      parent_hash: null,
      deleted_at: null,
    },
    orderBy: {
      created_at: "desc",
    },
    take: 1,
    select: {
      created_at: true,
    },
  })

  return casts
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
      const latestCasts = await getLatestCast(grant.id)
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
