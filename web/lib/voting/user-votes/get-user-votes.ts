"use server"

import { PERCENTAGE_SCALE } from "@/lib/config"
import database from "@/lib/database"
import { getEthAddress } from "@/lib/utils"

export async function getUserVotes(contract: `0x${string}`, voter: string | undefined) {
  if (!voter) return []

  const votes = await database.vote.findMany({
    select: { bps: true, recipientId: true },
    where: {
      contract,
      voter: getEthAddress(voter),
      isStale: 0,
    },
  })

  return votes.map((vote) => ({ ...vote, bps: (vote.bps / PERCENTAGE_SCALE) * 10000 }))
}
