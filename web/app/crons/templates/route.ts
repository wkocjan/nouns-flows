import "server-only"

import database from "@/lib/database"
import { NextResponse } from "next/server"
import { generateTemplate } from "./generate-template"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 300

export async function GET() {
  try {
    const flows = await database.grant.findMany({
      where: { isFlow: 1, isTopLevel: 0, template: null },
    })

    for (const flow of flows) {
      const { template } = await generateTemplate(flow.title, flow.description)
      console.debug({ title: flow.title, template })

      await database.template.create({ data: { content: template, grantId: flow.id } })

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    return NextResponse.json({ success: true, generatedTemplates: flows.length })
  } catch (error: any) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }
}
