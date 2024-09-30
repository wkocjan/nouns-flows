import { getPool } from "@/lib/database/queries/pool"
import { redirect } from "next/navigation"

export default async function NewCategoryPage() {
  const pool = await getPool()

  redirect(`/apply/${pool.id}`)
}
