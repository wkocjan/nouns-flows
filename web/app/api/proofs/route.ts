import { getUserAddressFromCookie } from "@/lib/auth/get-user-from-cookie"
import { fetchDelegatedTokens } from "@/lib/voting/delegated-tokens/get-delegated-tokens"
import { generateOwnerProofs } from "@/lib/voting/owner-proofs/proofs"
import { NextResponse } from "next/server"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Get user's Ethereum address from cookie
    const address = await getUserAddressFromCookie()
    if (!address) {
      throw new Error("No user found")
    }

    const rawTokens = await fetchDelegatedTokens(address)

    if (!rawTokens.length) {
      throw new Error("No delegated tokens found")
    }

    const tokens = rawTokens.map(({ id, owner }) => ({ id: BigInt(id), owner }))
    const proofs = await generateOwnerProofs(tokens)

    // Convert BigInt values to strings before serializing
    const serializedProofs = JSON.parse(
      JSON.stringify(proofs, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
    )
    return NextResponse.json(serializedProofs)
  } catch (error) {
    console.error(error)
    // Return error response if anything fails
    return NextResponse.json(
      { message: (error as Error).message || "Internal server error" },
      { status: 500 },
    )
  }
}
