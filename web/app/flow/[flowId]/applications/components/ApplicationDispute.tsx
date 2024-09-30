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

  const isVotingClosed = dispute && new Date() > new Date(dispute.votingEndTime * 1000)
  const isVotingOpen =
    dispute && new Date() > new Date(dispute.votingStartTime * 1000) && !isVotingClosed
  const canVote = isVotingOpen

  // ToDo: Check whether voting is active
  // ToDo: Check whether user has already voted
  // ToDo: Reveal votes

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
        {isVotingOpen && <div className="text-center text-sm">Cast your vote</div>}
        {!isVotingOpen && dispute && (
          <div className="text-center text-sm">
            {isVotingClosed ? "Voting closed " : "Voting starts "}
            <DateTime
              date={new Date(dispute.votingStartTime * 1000)}
              relative
              className="text-sm"
            />
          </div>
        )}
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
      </DialogContent>
    </Dialog>
  )
}
