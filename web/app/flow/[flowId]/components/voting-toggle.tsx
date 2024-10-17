"use client"

import { Button } from "@/components/ui/button"
import { useDelegatedTokens } from "@/lib/voting/delegated-tokens/use-delegated-tokens"
import { useVoting } from "@/lib/voting/voting-context"
import { useModal } from "connectkit"
import { toast } from "sonner"
import { useAccount } from "wagmi"

export const VotingToggle = () => {
  const { isLoading, isActive, activate } = useVoting()
  const { address } = useAccount()
  const { setOpen } = useModal()
  const { tokens } = useDelegatedTokens(address)

  return (
    <Button
      onClick={() => {
        if (!address) return setOpen(true)

        if (tokens.length === 0)
          return toast.error("You don't have any Nouns delegated to vote with")

        activate()
      }}
      disabled={isLoading || isActive}
      loading={isLoading}
    >
      {isActive ? "In progress..." : `Vote`}
    </Button>
  )
}
