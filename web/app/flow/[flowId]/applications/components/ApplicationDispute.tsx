"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { erc20VotesArbitratorImplAbi } from "@/lib/abis"
import { useDisputes } from "@/lib/tcr/dispute/use-disputes"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Grant } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { base } from "viem/chains"
import { DisputeDetails } from "./DisputeDetails"
import { useSecretVoteHash } from "../hooks/useSecretVoteHash"
import { DateTime } from "@/components/ui/date-time"
import { useAccount } from "wagmi"
import { useDisputeVote } from "@/lib/tcr/dispute/use-dispute-votes"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface Props {
  grant: Grant
  flow: Grant
}

export function ApplicationDispute(props: Props) {
  const { grant, flow } = props
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { address } = useAccount()

  const { dispute } = useDisputes(grant.id, !open)
  const { disputeVote } = useDisputeVote(
    dispute?.disputeId || "",
    address || "",
    flow.arbitrator,
    !dispute,
  )

  const { forSecretHash, againstSecretHash } = useSecretVoteHash(
    dispute && address ? `${dispute.arbitrator}-${dispute.disputeId}-${address}` : "",
  )
  const { writeContract, prepareWallet, isLoading, toastId } = useContractTransaction({
    onSuccess: async () => {
      ref.current?.click() // close dialog
      router.refresh()
    },
  })
  const ref = useRef<HTMLButtonElement>(null)

  const hasVoted = !!disputeVote
  const isVotingClosed = dispute && new Date() > new Date(dispute.votingEndTime * 1000)
  const isVotingOpen =
    dispute && new Date() > new Date(dispute.votingStartTime * 1000) && !isVotingClosed
  const canVote = isVotingOpen && !hasVoted

  // ToDo: Reveal votes via worker

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" ref={ref}>
          Vote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">{grant.title}</DialogTitle>
        </DialogHeader>
        <p className="mb-6">Some description about the dispute process</p>
        {dispute && <DisputeDetails dispute={dispute} />}
        {isVotingOpen && !hasVoted && <div className="text-center text-sm">Cast your vote</div>}
        {disputeVote && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center text-sm">You have successfully committed your vote</div>
            </TooltipTrigger>
            <TooltipContent>
              For your convenience, we store unhashed votes encrypted in a database.
              <br />
              Your vote will be revealed automatically at the end of the voting period.
              <br />
              You can opt out of custodial voting soon.
            </TooltipContent>
          </Tooltip>
        )}
        {!isVotingOpen && dispute && !disputeVote && (
          <div className="text-center text-sm">
            {isVotingClosed ? "Voting closed " : "Voting starts "}
            <DateTime
              date={
                isVotingClosed
                  ? new Date(dispute.votingEndTime * 1000)
                  : new Date(dispute.votingStartTime * 1000)
              }
              relative
              className="text-sm"
            />
          </div>
        )}
        {!hasVoted && (
          <div className="flex justify-center space-x-2">
            <Button
              disabled={!canVote || isLoading}
              loading={isLoading}
              type="button"
              onClick={async () => {
                try {
                  if (!dispute) return
                  if (!forSecretHash) throw new Error("No secret hash")
                  await prepareWallet()

                  writeContract({
                    address: getEthAddress(flow.arbitrator),
                    abi: erc20VotesArbitratorImplAbi,
                    functionName: "commitVote",
                    args: [BigInt(dispute.disputeId), forSecretHash],
                    chainId: base.id,
                  })
                } catch (e: any) {
                  toast.error(e.message, { id: toastId })
                }
              }}
            >
              Approve {grant.isFlow ? "category" : "grant"}
            </Button>
            <Button
              disabled={!canVote || isLoading}
              loading={isLoading}
              type="button"
              onClick={async () => {
                try {
                  if (!dispute) return
                  if (!againstSecretHash) throw new Error("No secret hash")
                  await prepareWallet()

                  writeContract({
                    address: getEthAddress(flow.arbitrator),
                    abi: erc20VotesArbitratorImplAbi,
                    functionName: "commitVote",
                    args: [BigInt(dispute.id), againstSecretHash],
                    chainId: base.id,
                  })
                } catch (e: any) {
                  toast.error(e.message, { id: toastId })
                }
              }}
            >
              Reject {grant.isFlow ? "category" : "grant"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
