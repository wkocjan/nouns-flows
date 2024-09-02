"use client"

import { Input } from "@/components/ui/input"
import { Grant } from "@/lib/data/grants"
import { useVoting } from "./voting-context"

interface Props {
  grant: Grant
}

export const VotingInput = (props: Props) => {
  const { grant } = props
  const { votes, updateVote, isActive, activate } = useVoting()

  if (!isActive)
    return (
      <button type="button" onClick={() => activate()}>
        {votes.find((v) => v.recipient === grant.id)?.bps || 0}
      </button>
    )

  return (
    <Input
      placeholder="0"
      value={votes.find((v) => v.recipient === grant.id)?.bps || ""}
      onChange={(e) =>
        updateVote({ recipient: grant.id, bps: parseFloat(e.target.value) })
      }
      min={0}
      max={100}
      type="number"
      step="1"
    />
  )
}
