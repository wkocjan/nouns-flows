import { useEffect, useState } from "react"
import { encodeAbiParameters, keccak256 } from "viem"

enum Party {
  None,
  Requester,
  Challenger,
}

export function useSecretVoteHash(keyPrefix: string) {
  const [forSecretHash, setForSecretHash] = useState<`0x${string}` | null>(null)
  const [againstSecretHash, setAgainstSecretHash] = useState<`0x${string}` | null>(null)

  useEffect(() => {
    const generateVoteHash = (isFor: boolean) => {
      const salt = crypto.getRandomValues(new Uint8Array(32))
      const saltHex = `0x${Buffer.from(salt).toString("hex")}` as `0x${string}`

      const hash = keccak256(
        encodeAbiParameters(
          [{ type: "uint256" }, { type: "string" }, { type: "bytes32" }],
          [BigInt(isFor ? 1 : 2), "", keccak256(saltHex)],
        ),
      )

      return hash
    }

    setForSecretHash(generateVoteHash(true))
    setAgainstSecretHash(generateVoteHash(false))
  }, [])

  if (!keyPrefix) return { forSecretHash: null, againstSecretHash: null }

  return { forSecretHash, againstSecretHash }
}
