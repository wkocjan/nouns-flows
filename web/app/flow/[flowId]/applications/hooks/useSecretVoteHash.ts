import { saveItem } from "@/lib/kv/kvStore"
import { useEffect, useState } from "react"
import { encodeAbiParameters, keccak256 } from "viem"

export enum Party {
  None, // Party per default when there is no challenger or requester. Also used for inconclusive ruling.
  Requester, // Party that made the request to change a status.
  Challenger, // Party that challenges the request to change a status.
}
interface SavedVote {
  choice: Party
  reason: string
  disputeId: number
  voter: `0x${string}`
  salt: `0x${string}`
  commitmentHash: `0x${string}`
}

export function useSecretVoteHash(arbitrator: string, disputeId: string, address: string) {
  const [forSecretHash, setForSecretHash] = useState<`0x${string}` | null>(null)
  const [againstSecretHash, setAgainstSecretHash] = useState<`0x${string}` | null>(null)

  useEffect(() => {
    const generateVoteHash = async (party: Party) => {
      const { commitmentHash, salt } = await generateCommitment(party)

      await saveItem(generateKVKey(arbitrator, disputeId, address), {
        choice: party,
        reason: "",
        disputeId,
        voter: address,
        salt,
        commitmentHash,
      })

      if (party === Party.Requester) {
        setForSecretHash(commitmentHash)
      } else {
        setAgainstSecretHash(commitmentHash)
      }
    }

    generateVoteHash(Party.Requester)
    generateVoteHash(Party.Challenger)
  }, [arbitrator, disputeId, address])

  if (!arbitrator || !disputeId || !address) return { forSecretHash: null, againstSecretHash: null }

  return { forSecretHash, againstSecretHash }
}

const generateCommitment = async (
  party: Party,
): Promise<{ commitmentHash: `0x${string}`; salt: `0x${string}` }> => {
  const salt = generateSalt()
  const hash = keccak256(
    encodeAbiParameters(
      [{ type: "uint256" }, { type: "string" }, { type: "bytes32" }],
      [BigInt(party), "", salt],
    ),
  )

  return { commitmentHash: hash, salt }
}

function generateSalt(): `0x${string}` {
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  return `0x${Buffer.from(randomBytes).toString("hex")}` as `0x${string}`
}

function generateKVKey(arbitrator: string, disputeId: string, address: string): string {
  // guaranteed to be unique across disputes since you can only vote once per dispute per arbitrator per address
  return `vote:${arbitrator}:${disputeId}:${address}`
}
