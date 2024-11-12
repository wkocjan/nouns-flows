import { getGuidance } from "@/app/components/action-card/get-guidance"
import { getUserAddressFromCookie } from "@/lib/auth/get-user-from-cookie"
import { kv } from "@vercel/kv"

export const runtime = "edge"
export const maxDuration = 30

export async function POST(req: Request) {
  const address = await getUserAddressFromCookie()

  const key = `action-card-${address?.toLowerCase() || "guest"}`

  const cached = await kv.get(key)
  if (cached != null) {
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  const result = await getGuidance(address, async (data) => {
    await kv.set(key, data)
    await kv.expire(key, 60 * 60 * 4) // 4 hours
  })

  return result.toTextStreamResponse()
}
