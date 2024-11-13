import { getPool } from "@/lib/database/queries/pool"
import { redirect } from "next/navigation"
import { getPageRuntime } from "@/lib/database/edge"

export const runtime = getPageRuntime()

export default async function NewFlowPage() {
  const pool = await getPool()

  redirect(`/apply/${pool.id}`)
}
