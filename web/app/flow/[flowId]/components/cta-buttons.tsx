"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { VotingToggle } from "./voting-toggle"
import { useAccount } from "wagmi"
import { useVotingPower } from "@/lib/voting/use-voting-power"

export function CTAButtons() {
  const { isConnected } = useAccount()
  const { votingPower } = useVotingPower()

  const showVotingToggle = isConnected && votingPower > 0

  return (
    <div className="flex items-center space-x-4">
      <Button variant={showVotingToggle ? "outline" : "default"}>
        <Link href={`/apply`}>Apply</Link>
      </Button>
      {showVotingToggle && <VotingToggle />}
    </div>
  )
}
