import "server-only"

import database from "@/lib/database"
import { getItem, saveItem } from "@/lib/kv/kvStore"
import { isProduction } from "@/lib/utils"
import { NextResponse } from "next/server"
import { analyzeCast } from "./analyze-cast"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 300

const KV_KEY = "last-analyzed-cast-time"

export async function GET() {
  try {
    const lastAnalyzedDate = new Date((await getItem<string>(KV_KEY)) || "0")

    console.debug("Analyzing casts after", lastAnalyzedDate)

    const grants = await database.grant.findMany({
      where: { isActive: 1, isFlow: 0, isTopLevel: 0 },
      include: { flow: true },
    })

    const recipients = Array.from(new Set(grants.map((grant) => grant.recipient.toLowerCase())))

    const casts = await database.cast.findMany({
      where: {
        createdAt: { gt: lastAnalyzedDate },
        user: { addresses: { hasSome: recipients } },
      },
      orderBy: { createdAt: "asc" },
      take: isProduction() ? 30 : 1,
      include: { user: true },
    })

    for (const cast of casts) {
      const { grantId, isGrantUpdate, reason, confidenceScore } = await analyzeCast(
        cast,
        grants.filter((g) => cast.user.addresses.includes(g.recipient)),
      )

      console.debug({ text: cast.text, isGrantUpdate, reason, confidenceScore, grantId })

      if (isGrantUpdate) {
        await database.cast.update({ where: { hash: cast.hash }, data: { grantId } })
      }

      await saveItem(KV_KEY, cast.createdAt.toISOString())

      await new Promise((resolve) => setTimeout(resolve, 250))
    }

    return NextResponse.json({ success: true, analyzedCasts: casts.length })
  } catch (error: any) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }
}
