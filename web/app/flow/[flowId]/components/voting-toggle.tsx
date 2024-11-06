"use client"

import { Button } from "@/components/ui/button"
import { useDelegatedTokens } from "@/lib/voting/delegated-tokens/use-delegated-tokens"
import { useVoting } from "@/lib/voting/voting-context"
import { usePrivy } from "@privy-io/react-auth"
import { toast } from "sonner"
import { useAccount } from "wagmi"

export const VotingToggle = () => {
  const { isLoading, isActive, activate } = useVoting()
  const { address } = useAccount()
  const { login } = usePrivy()
  const { tokens } = useDelegatedTokens(address)

  return (
    <Button
      onClick={() => {
        if (!address) {
          login()
          return
        }

        if (tokens.length === 0) {
          return toast.error("You don't have any Nouns delegated to vote with", { duration: 450 })
        }

        activate()
      }}
      disabled={isLoading || isActive}
      loading={isLoading}
    >
      {isActive ? "In progress..." : `Vote`}
    </Button>
  )
}
