import { getPool } from "@/lib/database/queries/pool"
import { redirect } from "next/navigation"

export const runtime = "nodejs"

export default async function NewFlowPage() {
  const pool = await getPool()

  redirect(`/apply/${pool.id}`)
}
