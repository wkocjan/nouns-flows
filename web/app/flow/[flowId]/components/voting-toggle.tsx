"use client"

import { Button } from "@/components/ui/button"
import { useVoting } from "@/lib/voting/voting-context"

export const VotingToggle = () => {
  const { isLoading, isActive, activate } = useVoting()

  return (
    <Button onClick={activate} disabled={isLoading || isActive} loading={isLoading}>
      {isActive ? "In progress..." : `Vote for grants`}
    </Button>
  )
}
