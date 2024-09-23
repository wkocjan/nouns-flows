"use client"

import { useDelegatedTokens } from "@/lib/voting/delegated-tokens/use-delegated-tokens"
import { generateOwnerProofs } from "@/lib/voting/owner-proofs/proofs"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Vote } from "@prisma/client"
import { useRouter } from "next/navigation"
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { toHex } from "viem"
import { useAccount } from "wagmi"
import { nounsFlowAbi } from "../abis"
import { PERCENTAGE_SCALE } from "../config"
import { useUserVotes } from "./user-votes/use-user-votes"

type UserVote = Pick<Vote, "bps" | "recipientId">

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
  props: PropsWithChildren<{ contract: `0x${string}`; chainId: number }>,
) => {
  const { children, contract, chainId } = props
  const [isActive, setIsActive] = useState(false)
  const [votes, setVotes] = useState<UserVote[]>()
  const { address } = useAccount()
  const router = useRouter()

  const { votes: userVotes, mutate } = useUserVotes(contract, address)

  const { writeContract, prepareWallet, isLoading } = useContractTransaction({
    chainId,
    onSuccess: async () => {
      setTimeout(() => {
        mutate()
        router.refresh()
      }, 3000) // refresh votes data when ingestion should be finished
      setIsActive(false)
    },
  })

  const { tokens } = useDelegatedTokens(address?.toLocaleLowerCase())

  useEffect(() => {
    if (typeof votes !== "undefined") return
    if (!userVotes.length) return
    setVotes(userVotes)
  }, [votes, userVotes])

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
        votes: votes || [],
        saveVotes: async () => {
          if (!votes) return
          if (!tokens.length || !address) return toast.error("No delegated tokens found")

          const toastId = toast.loading("Preparing vote...")
          const tokenIds = tokens.map(({ id }) => id)
          const delegators = Array.from(new Set(tokens.map((token) => token.owner)))

          const proofs = await generateOwnerProofs(tokenIds, delegators)

          if (proofs.error !== false) {
            return toast.error("Failed to generate token ownership proofs", {
              description: proofs.error,
            })
          }

          const recipientIds = votes.map((vote) => toHex(vote.recipientId))
          const percentAllocations = votes.map((vote) => (vote.bps / 10000) * PERCENTAGE_SCALE)
          const { ownershipStorageProofs, delegateStorageProofs, ...baseProofParams } = proofs

          await prepareWallet(toastId)

          writeContract({
            account: address,
            abi: nounsFlowAbi,
            functionName: "castVotes",
            address: contract,
            chainId,
            args: [
              delegators,
              delegators.map((delegator) =>
                tokens.filter((token) => token.owner === delegator).map((token) => token.id),
              ),
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
            ...(votes || []).filter((v) => v.recipientId !== recipientId),
            ...(bps > 0 ? [{ recipientId, bps }] : []),
          ])
        },
        isLoading,
        allocatedBps: votes?.reduce((acc, v) => acc + v.bps, 0) || 0,
        votedCount: votes?.filter((v) => v.bps > 0).length || 0,
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
