import { generateKVKey, generateSalt, Party, SavedVote } from "@/lib/kv/disputeVote"
import { saveOrGet } from "@/lib/kv/kvStore"
import { useEffect, useState } from "react"
import { encodeAbiParameters, keccak256 } from "viem"

export function useSecretVoteHash(arbitrator: string, disputeId: string, address?: string) {
  const [forSecretHash, setForSecretHash] = useState<`0x${string}` | null>(null)
  const [againstSecretHash, setAgainstSecretHash] = useState<`0x${string}` | null>(null)

  useEffect(() => {
    if (!address) return

    const generateVoteHash = async (party: Party) => {
      const { commitmentHash, salt } = generateCommitment(party)

      const key = generateKVKey(arbitrator, disputeId, address)
      const data: SavedVote = {
        choice: party,
        reason: "",
        disputeId: parseInt(disputeId),
        voter: address as `0x${string}`,
        salt,
        commitmentHash,
      }

      // pull if already saved, otherwise save
      const vote = await saveOrGet(key, data)

      if (party === Party.Requester) {
        setForSecretHash(vote.commitmentHash)
      } else {
        setAgainstSecretHash(vote.commitmentHash)
      }
    }

    generateVoteHash(Party.Requester)
    generateVoteHash(Party.Challenger)
  }, [arbitrator, disputeId, address])

  if (!arbitrator || !disputeId || !address) return { forSecretHash: null, againstSecretHash: null }

  return { forSecretHash, againstSecretHash }
}

const generateCommitment = (
  party: Party,
): { commitmentHash: `0x${string}`; salt: `0x${string}` } => {
  const salt = generateSalt()
  const hash = keccak256(
    encodeAbiParameters(
      [{ type: "uint256" }, { type: "string" }, { type: "bytes32" }],
      [BigInt(party), "", salt],
    ),
  )

  return { commitmentHash: hash, salt }
}
