"use client"

import { Button } from "@/components/ui/button"
import {
  isDisputeResolvedForNoneParty,
  isRequestRejected,
} from "@/lib/database/helpers/application"

import { Dispute, Grant } from "@prisma/client"
import Link from "next/link"
import { useVotingReceipt } from "../hooks/useVotingReceipt"
import { useAccount } from "wagmi"
import { Address } from "viem"

interface Props {
  dispute: Dispute
  grant: Grant
  className?: string
}

export function ApplicationDisputeVoteCta(props: Props) {
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
