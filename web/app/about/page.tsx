import { getPool } from "@/lib/database/queries/pool"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const pool = await getPool()
  return {
    title: `About | ${pool.title}`,
    description: "Learn more about the grants program and how to apply for funding.",
  }
}

export default function AboutPage() {
  return (
    <main className="container mt-2.5 md:mt-6">
      <p>About...</p>
    </main>
  )
}
