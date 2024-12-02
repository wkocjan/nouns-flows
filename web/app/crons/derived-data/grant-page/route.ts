import "server-only"

import { generateAndStoreGrantPageData } from "@/app/item/[grantId]/page-data/get"
import database from "@/lib/database/edge"
import { NextResponse } from "next/server"

export const maxDuration = 300

export async function GET() {
  try {
    const grants = await database.grant.findMany({
      where: {
        isFlow: 0,
        isTopLevel: 0,
        OR: [{ derivedData: null }, { derivedData: { pageData: null } }],
      },
      take: 2,
    })

    for (const grant of grants) {
      await generateAndStoreGrantPageData(grant.id)

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    return NextResponse.json({ success: true, generatedPages: grants.length })
  } catch (error: any) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }
}
