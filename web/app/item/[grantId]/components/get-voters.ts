import "server-only"

import database from "@/lib/database/edge"

export async function getVoters(contract: `0x${string}`, recipientId: string) {
  const voters = await database.$queryRaw<{ voter: `0x${string}`; votes_count: BigInt }[]>`
         SELECT voter, SUM(CAST("votes_count" AS INTEGER)) as "votes_count"
         FROM "Vote"
         WHERE "contract" = ${contract} AND "recipientId" = ${recipientId} AND "isStale" = 0
         GROUP BY voter    
        `

  return voters.map((v) => ({ ...v, votesCount: v.votes_count.toString() }))
}
