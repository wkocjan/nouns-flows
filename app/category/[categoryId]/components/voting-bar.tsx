"use client"

import { Button } from "@/components/ui/button"
import { useVoting } from "./voting-context"

interface Props {}

export const VotingBar = (props: Props) => {
  const { isActive, cancel, saveVotes } = useVoting()

  if (!isActive) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between py-4">
        <div className="grow">
          Voting progress/allocation information here...
        </div>
        <div className="shrink-0 space-x-2.5">
          <Button variant="link" type="button" onClick={cancel}>
            Cancel
          </Button>
          <Button onClick={saveVotes}>Save votes</Button>
        </div>
      </div>
    </div>
  )
}
