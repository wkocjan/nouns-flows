"use client"

import { isDisputeResolvedForNoneParty, isRequestRejected } from "@/app/components/dispute/helpers"
import { Button } from "@/components/ui/button"
import { Dispute, Grant } from "@prisma/client"
import Link from "next/link"
import { Address } from "viem"
import { useAccount } from "wagmi"
import { useVotingReceipt } from "./useVotingReceipt"

interface Props {
  dispute: Dispute
  grant: Grant
  className?: string
}

export function DisputeVoteCta(props: Props) {
  const { dispute, grant } = props
  const { address } = useAccount()

  const receipt = useVotingReceipt(dispute.arbitrator as Address, dispute.disputeId, address)

  const isDisputeUnresolved = isDisputeResolvedForNoneParty(dispute)
  const isGrantRejected = isRequestRejected(grant, dispute)
  const isGrantRejectedOrUnresolved = isDisputeUnresolved || isGrantRejected

  const text = (() => {
    switch (true) {
      case receipt?.hasRevealed && grant.isDisputed === 1:
        return "Voted"
      case isGrantRejectedOrUnresolved:
        return "View"
      case !receipt?.hasRevealed &&
        receipt?.hasCommitted &&
        dispute.revealPeriodEndTime > Date.now() / 1000:
        return "Reveal"
      case receipt?.hasCommitted:
        return "Review"
      default:
        return "Vote"
    }
  })()

  return (
    <Link href={`/application/${grant.id}`}>
      <Button
        variant={isGrantRejectedOrUnresolved || receipt?.hasCommitted ? "secondary" : "default"}
      >
        {text}
      </Button>
    </Link>
  )
}
