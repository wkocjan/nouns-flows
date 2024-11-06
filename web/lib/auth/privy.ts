import "server-only"
import { PrivyClient } from "@privy-io/server-auth"
import * as jose from "jose"
import { cookies } from "next/headers"
import { getEthAddress } from "../utils"

export const privy = new PrivyClient(
  `${process.env.NEXT_PUBLIC_PRIVY_APP_ID}`,
  `${process.env.PRIVY_APP_SECRET}`,
)

export const verificationKey = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEB1GUPYZCvCfMHfxcHwUb6rtzdp4LtC7V8tjdHA+l9y2YIzNmA1PyaQDDMNH9xz4bL5hDDsjuFriGzH4ODS4ZGQ==
-----END PUBLIC KEY-----`

export async function getUserAddressFromCookie() {
  const token = cookies().get("privy-id-token")
  if (!token) return null

  try {
    const { payload } = await jose.jwtVerify(
      token.value,
      await jose.importSPKI(verificationKey, "ES256"),
      {
        issuer: "privy.io",
        audience: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
      },
    )

    if (!payload || !payload.sub) return null

    const linkedAccounts = JSON.parse(payload.linked_accounts as string) as {
      type: string
      address: string
    }[]

    if (!linkedAccounts.length) return null

    return getEthAddress(linkedAccounts[0].address)
  } catch (error) {
    console.error(error)
    return null
  }
}
