"use client"

import { Button } from "@/components/ui/button"
import { erc20VotesArbitratorImplAbi } from "@/lib/abis"
import { useDisputeVote } from "@/lib/tcr/dispute/use-dispute-votes"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Dispute, DisputeVote, Grant } from "@prisma/client"
import { ThickArrowDownIcon, ThickArrowUpIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { useSecretVoteHash } from "../hooks/useSecretVoteHash"
import { useArbitratorData } from "@/lib/tcr/use-arbitrator-data"
import { formatEther } from "viem"

interface Props {
  grant: Grant
  flow: Grant
  dispute: Dispute
}

export function DisputeUserVote(props: Props) {
  const { grant, flow, dispute } = props
  const router = useRouter()
  const { address } = useAccount()
  const [canVote, setCanVote] = useState(false)

  const { disputeVote, mutate } = useDisputeVote(
    dispute.disputeId,
    address!,
    flow.arbitrator,
    !address,
  )

  const { canVote: canVoteOnchain, votingPower } = useArbitratorData(
    flow.arbitrator as `0x${string}`,
    dispute.disputeId,
  )

  const { forCommitHash, againstCommitHash } = useSecretVoteHash(
    flow.arbitrator,
    dispute.disputeId,
    address,
  )

  const { writeContract, prepareWallet, isLoading, toastId } = useContractTransaction({
    onSuccess: () => {
      setTimeout(() => {
        router.refresh()
        mutate()
      }, 1000)
    },
  })

  const hasVoted = !!disputeVote
  const isVotingClosed = new Date() > new Date(dispute.votingEndTime * 1000)
  const isVotingOpen = new Date() > new Date(dispute.votingStartTime * 1000) && !isVotingClosed

  useEffect(() => {
    setCanVote(isVotingOpen && !hasVoted && !!address && canVoteOnchain)
  }, [isVotingOpen, hasVoted, address, canVoteOnchain])

  if (hasVoted) {
    if (!disputeVote.choice && new Date() > new Date(dispute.revealPeriodEndTime * 1000)) {
      return <UnrevealedVote />
    } else if (disputeVote.choice) {
      return <RevealedVote disputeVote={disputeVote} grant={grant} />
    } else {
      return <CommittedVote />
    }
  }

  if (isVotingClosed) {
    return <div className="text-sm">Voting is over. You didn&apos;t vote in this dispute.</div>
  }

  return (
    <div>
      <div className="flex space-x-4">
        <Button
          disabled={isLoading || !canVote}
          loading={isLoading}
          className="grow"
          type="button"
          onClick={async () => {
            try {
              if (!forCommitHash) throw new Error("No secret hash")
              await prepareWallet()

              writeContract({
                address: getEthAddress(flow.arbitrator),
                abi: erc20VotesArbitratorImplAbi,
                functionName: "commitVote",
                args: [BigInt(dispute.disputeId), forCommitHash],
                chainId: base.id,
              })
            } catch (e: any) {
              toast.error(e.message, { id: toastId })
            }
          }}
        >
          <ThickArrowUpIcon className="mr-2 size-4" />
          Approve {grant.isFlow ? "category" : "grant"}
        </Button>

        <Button
          disabled={isLoading || !canVote}
          loading={isLoading}
          type="button"
          className="grow"
          onClick={async () => {
            try {
              if (!againstCommitHash) throw new Error("No secret hash")
              await prepareWallet()

              writeContract({
                address: getEthAddress(flow.arbitrator),
                abi: erc20VotesArbitratorImplAbi,
                functionName: "commitVote",
                args: [BigInt(dispute.disputeId), againstCommitHash],
                chainId: base.id,
              })
            } catch (e: any) {
              toast.error(e.message, { id: toastId })
            }
          }}
        >
          Reject {grant.isFlow ? "category" : "grant"}
          <ThickArrowDownIcon className="ml-2 size-4" />
        </Button>
      </div>
      {!isVotingOpen && (
        <div className="mt-3 text-center text-xs text-muted-foreground">
          Voting is not open yet.
        </div>
      )}
      {canVoteOnchain && canVote && (
        <div className="mt-3 text-center text-xs text-muted-foreground">
          Vote with {formatEther(votingPower)} votes.
        </div>
      )}
    </div>
  )
}

const UnrevealedVote = () => (
  <div className="space-y-4 text-sm">
    <h3 className="font-medium">Your vote was not revealed in time</h3>
    <p>This is a bug on our side. Please contact rocketman ASAP.</p>
  </div>
)

const RevealedVote = ({ disputeVote, grant }: { disputeVote: DisputeVote; grant: Grant }) => (
  <div className="space-y-4 text-sm">
    <p>Your vote has been revealed and counted.</p>
    <p>
      You voted{" "}
      <b className={`capitalize ${disputeVote.choice === 1 ? "text-green-500" : "text-red-500"}`}>
        {disputeVote.choice === 1 ? "for" : "against"}
      </b>{" "}
      this {grant.isFlow ? "category" : "grant"} with {disputeVote.votes} votes.
    </p>
  </div>
)

const CommittedVote = () => (
  <div className="space-y-4 text-sm">
    <h3 className="font-medium">You have successfully committed your vote</h3>
    <p className="text-muted-foreground">
      TCRs use commit-reveal voting. You have committed your vote onchain.
    </p>
    <p className="text-muted-foreground">
      For your convenience, we store your vote encrypted in a database. Your vote will be revealed
      automatically at the end of the voting period.
    </p>
    <p className="text-muted-foreground">You can opt out of custodial voting soon.</p>
  </div>
)
