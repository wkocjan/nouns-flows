import "server-only"

import { NextResponse } from "next/server"
import database from "@/lib/database"
import { getItem } from "@/lib/kv/kvStore"
import { generateKVKey, SavedVote } from "@/lib/kv/disputeVote"

export const dynamic = "force-dynamic"
export const revalidate = 3600
export const maxDuration = 300

export async function GET() {
  try {
    const disputes = await database.dispute.findMany({
      where: {
        isExecuted: 0,
        revealPeriodEndTime: { gt: Number(new Date().getTime() / 1000) },
        votingEndTime: { lt: Number(new Date().getTime() / 1000) },
      },
    })

    console.log("disputes", disputes)

    for (const dispute of disputes) {
      const { arbitrator, disputeId } = dispute

      const votes = await database.disputeVote.findMany({
        where: { disputeId: dispute.disputeId, arbitrator },
      })

      console.log("votes", votes)

      const voters = votes.map((vote) => vote.voter)

      const keys = voters.map((voter) => generateKVKey(arbitrator, disputeId, voter))

      console.log("keys", keys)

      for (const key of keys) {
        const vote = await getItem<SavedVote>(key)
        console.log("vote", vote)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error({ error })
    return new Response(error.message, { status: 500 })
  }
}
