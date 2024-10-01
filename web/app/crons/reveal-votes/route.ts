import "server-only"

import { NextResponse } from "next/server"
import database from "@/lib/database"
import { getItem } from "@/lib/kv/kvStore"
import { generateKVKey, Party, SavedVote } from "@/lib/kv/disputeVote"
import { getRevealVotesWalletClient } from "./walletClient"
import { base } from "viem/chains"
import { erc20VotesArbitratorImplAbi } from "@/lib/abis"

export const dynamic = "force-dynamic"
export const revalidate = 3600
export const maxDuration = 300

export async function GET() {
  try {
    const client = getRevealVotesWalletClient(base.id)

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
        where: { disputeId: dispute.disputeId, arbitrator, choice: null }, // only pull unrevealed votes
      })

      console.log("votes", votes)

      const voters = votes.map((vote) => vote.voter)

      const keys = voters.map((voter) => generateKVKey(arbitrator, disputeId, voter))

      console.log("keys", keys)

      for (const key of keys) {
        const vote = await getItem<SavedVote>(key)
        console.log("vote", vote)

        if (!vote) {
          throw new Error("Vote not found")
        }

        const tx = await client.writeContract({
          address: arbitrator as `0x${string}`,
          abi: erc20VotesArbitratorImplAbi,
          functionName: "revealVote",
          args: [BigInt(disputeId), vote.voter, BigInt(vote.choice), vote.reason ?? "", vote.salt],
        })

        console.log("tx", tx)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error({ error })
    return new Response(error.message, { status: 500 })
  }
}
