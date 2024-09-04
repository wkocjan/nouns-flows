"use client"

import { Vote } from "@/lib/data/votes"
import { grantsAbi } from "@/lib/wagmi/contracts"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { PropsWithChildren, createContext, useContext, useState } from "react"
import { useAccount } from "wagmi"

interface VotingContextType {
  activate: () => void
  cancel: () => void
  isActive: boolean

  votes: Vote[]
  saveVotes: () => void
  updateVote: (vote: Vote) => void
  isLoading: boolean

  allocatedBps: number
  votedCount: number
}

const VotingContext = createContext<VotingContextType | null>(null)

export const VotingProvider = (
  props: PropsWithChildren<{
    userVotes: Vote[]
    contract: `0x${string}`
    chainId: number
  }>,
) => {
  const { children, userVotes, contract, chainId } = props
  const [isActive, setIsActive] = useState(false)
  const [votes, setVotes] = useState<Vote[]>(userVotes)

  const { writeContract, prepareWallet, isLoading } = useContractTransaction({
    chainId,
    onSuccess: console.debug,
  })

  const { address } = useAccount()

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
          await prepareWallet()

          writeContract({
            account: address,
            abi: grantsAbi,
            functionName: "claimAllFromPool",
            address: contract,
            chainId,
            args: [address!!],
          })
        },
        updateVote: (vote: Vote) => {
          const { recipient, bps } = vote

          setVotes([
            ...votes.filter((v) => v.recipient !== recipient),
            ...(bps > 0 ? [{ recipient, bps }] : []),
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
