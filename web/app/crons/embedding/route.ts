import { queryEmbeddings } from "../../apply/[flowId]/chat/query-embeddings"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query) {
    return new Response("Query parameter is required", { status: 400 })
  }

  const result = await queryEmbeddings({
    type: "grant-application", // Using flow as default type for testing
    query,
    groups: [], // Minimal required group for testing
    users: [], // Empty users array for testing
    tags: [], // Empty tags array for testing
  })

  return new Response(JSON.stringify({ result }), {
    headers: { "Content-Type": "application/json" },
  })
}
