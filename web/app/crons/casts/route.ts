import "server-only"

import { FLOWS_CHANNEL_ID, NOUNS_CHANNEL_ID } from "@/lib/config"
import database from "@/lib/database"
import { Cast as RawCast } from "@/lib/farcaster/client"
import { getCastImages } from "@/lib/farcaster/get-cast-images"
import { getCastVideos } from "@/lib/farcaster/get-cast-videos"
import { getFarcasterChannelCasts } from "@/lib/farcaster/get-channel-casts"
import { Cast, FarcasterUser } from "@prisma/client"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

const channelIds = [NOUNS_CHANNEL_ID, FLOWS_CHANNEL_ID]

export async function GET() {
  try {
    const latestCast = await database.cast.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    })

    const latestTime = latestCast ? latestCast.createdAt.getTime() : 0

    const casts: Array<RawCast & { channelId: string }> = []

    for (const channelId of channelIds) {
      const channelCasts = (
        await getFarcasterChannelCasts(channelId, latestTime ? 100 : 250)
      ).filter((cast) => new Date(cast.timestamp).getTime() > latestTime)

      casts.push(...channelCasts.map((cast) => ({ ...cast, channelId })))
    }

    const usersCount = await upserFarcasterUsers(casts)

    await database.cast.createMany({
      data: casts.map(
        (cast) =>
          ({
            hash: cast.hash,
            channelId: cast.channelId,
            fid: cast.author.fid,
            text: cast.text,
            images: getCastImages(cast),
            videos: getCastVideos(cast),
            createdAt: new Date(cast.timestamp),
            grantId: null,
          }) satisfies Cast,
      ),
    })

    return NextResponse.json({ success: true, newCasts: casts.length, updatedUsers: usersCount })
  } catch (error: any) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }
}

async function upserFarcasterUsers(casts: RawCast[]) {
  const users = new Map<FarcasterUser["fid"], Omit<FarcasterUser, "fid">>()

  casts.forEach(({ author }) => {
    if (users.has(author.fid)) return

    users.set(author.fid, {
      username: author.username,
      displayName: author.display_name || author.username,
      imageUrl: author.pfp_url || "",
      addresses: author.verified_addresses.eth_addresses.map((address) => address.toLowerCase()),
    })
  })

  await Promise.all(
    Array.from(users).map(async ([fid, user]) => {
      await database.farcasterUser.upsert({
        where: { fid },
        update: { ...user },
        create: { ...user, fid },
      })
    }),
  )

  return users.size
}
