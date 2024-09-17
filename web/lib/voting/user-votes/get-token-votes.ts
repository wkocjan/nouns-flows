"use server"

import { PERCENTAGE_SCALE } from "@/lib/config"
import database from "@/lib/database"

export async function getTokenVotes(contract: `0x${string}`, tokenIds: string[]) {
  if (!tokenIds.length) return []

  const votes = await database.vote.findMany({
    select: { bps: true, recipientId: true },
    where: {
      contract,
      tokenId: { in: tokenIds },
      isStale: 0,
    },
    distinct: ["recipientId"],
  })

  return votes.map((vote) => ({ ...vote, bps: (vote.bps / PERCENTAGE_SCALE) * 10000 }))
}
