"use client"

import { Button } from "@/components/ui/button"
import { useVoting } from "@/lib/voting/voting-context"

export const VotingToggle = () => {
  const { isLoading, isActive, activate, votes } = useVoting()

  const hasVotes = votes.length > 0

  return (
    <Button onClick={activate} disabled={isLoading || isActive} loading={isLoading}>
      {isActive ? "In progress..." : `${hasVotes ? "Edit" : "Cast"} your votes`}
    </Button>
  )
}
