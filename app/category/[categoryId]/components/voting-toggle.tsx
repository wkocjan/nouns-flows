"use client"

import { Button } from "@/components/ui/button"
import { useVoting } from "./voting-context"

export const VotingToggle = () => {
  const { isLoading, saveVotes } = useVoting()
  return (
    <Button onClick={saveVotes} disabled={isLoading} loading={isLoading}>
      Save Votes
    </Button>
  )
}
