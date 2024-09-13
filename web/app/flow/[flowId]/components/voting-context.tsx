"use client"

import { getEthAddress } from "@/lib/utils"
import { generateOwnerProofs } from "@/lib/voting/owner-proofs/proofs"
import { useDelegatedTokens } from "@/lib/voting/use-delegated-tokens"
import { NounsFlowAbi } from "@/lib/wagmi/abi"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { useAccount } from "wagmi"

type UserVote = { recipientId: string; bps: number }

interface VotingContextType {
  activate: () => void
  cancel: () => void
  isActive: boolean

  votes: UserVote[]
  saveVotes: () => void
  updateVote: (vote: UserVote) => void
  isLoading: boolean

  allocatedBps: number
  votedCount: number
}

const VotingContext = createContext<VotingContextType | null>(null)

export const VotingProvider = (
  props: PropsWithChildren<{
    userVotes: UserVote[]
    contract: `0x${string}`
    chainId: number
  }>,
) => {
  const { children, userVotes, contract, chainId } = props
  const [isActive, setIsActive] = useState(false)
  const [votes, setVotes] = useState<UserVote[]>(userVotes)

  const { writeContract, prepareWallet, isLoading } = useContractTransaction({
    chainId,
    onSuccess: console.debug,
  })

  const { address } = useAccount()
  const { tokenIds } = useDelegatedTokens(address?.toLocaleLowerCase())

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isActive) setIsActive(false)
    }

    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isActive])

  return (
    <VotingContext.Provider
      value={{
        isActive,
        activate: () => setIsActive(true),
        cancel: () => {
          setIsActive(false)
          setVotes(userVotes)
        },
        votes,
        saveVotes: async () => {
          if (!tokenIds.length || !address) return toast.error("No delegated tokens found")

          const toastId = toast.loading("Preparing vote...")

          const proofs = await generateOwnerProofs({
            tokenIds,
            delegators: [getEthAddress(address)],
          })

          if (typeof proofs === "string") {
            return toast.error("Failed to generate token ownership proofs", {
              description: proofs,
            })
          }

          const owners = tokenIds.map(() => getEthAddress(address))
          const recipientIds = votes.map((vote) => BigInt(vote.recipientId))
          const percentAllocations = votes.map((vote) => vote.bps)
          const { ownershipStorageProofs, delegateStorageProofs, ...baseProofParams } = proofs

          await prepareWallet(toastId)

          writeContract({
            account: address,
            abi: NounsFlowAbi,
            functionName: "castVotes",
            address: contract,
            chainId,
            args: [
              owners,
              [tokenIds],
              recipientIds,
              percentAllocations,
              baseProofParams,
              [ownershipStorageProofs],
              delegateStorageProofs,
            ],
          })
        },
        updateVote: (vote: UserVote) => {
          const { recipientId, bps } = vote

          setVotes([
            ...votes.filter((v) => v.recipientId !== recipientId),
            ...(bps > 0 ? [{ recipientId, bps }] : []),
          ])
        },
        isLoading,
        allocatedBps: votes.reduce((acc, v) => acc + v.bps, 0) || 0,
        votedCount: votes.filter((v) => v.bps > 0).length || 0,
      }}
    >
      {children}
    </VotingContext.Provider>
  )
}

export const useVoting = (): VotingContextType => {
  const context = useContext(VotingContext)
  if (context === null) {
    throw new Error("useVoting must be used within a VotingProvider")
  }
  return context
}
