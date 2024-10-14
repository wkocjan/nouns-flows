"use client"

import { canBeChallenged } from "@/app/components/dispute/helpers"
import { SwapTokenButton } from "@/app/token/swap-token-button"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { erc20VotesArbitratorImplAbi, flowTcrImplAbi } from "@/lib/abis"
import { useTcrData } from "@/lib/tcr/use-tcr-data"
import { useTcrToken } from "@/lib/tcr/use-tcr-token"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Grant } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { toast } from "sonner"
import { Address, formatEther } from "viem"
import { base } from "viem/chains"

interface Props {
  grant: Grant
  flow: Grant
  className?: string
}

export function DisputeStartButton(props: Props) {
  const { grant, flow, className } = props
  const router = useRouter()

  const { writeContract, prepareWallet, isLoading, toastId } = useContractTransaction({
    loading: "Challenging...",
    success: "Challenged!",
    onSuccess: async () => {
      ref.current?.click() // close dialog
      setTimeout(() => {
        router.refresh()
      }, 1000)
    },
  })
  const ref = useRef<HTMLButtonElement>(null)

  const { challengeSubmissionCost, addItemCost, arbitrationCost } = useTcrData(
    getEthAddress(flow.tcr),
  )
  const token = useTcrToken(getEthAddress(flow.erc20), getEthAddress(flow.tcr))

  const hasEnoughBalance = token.balance >= challengeSubmissionCost
  const hasEnoughAllowance = token.allowance >= challengeSubmissionCost

  const type = grant.isActive ? "removal request" : "application"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" ref={ref} disabled={!canBeChallenged(grant)} className={className}>
          Challenge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium capitalize">
            Challenge {type}
          </DialogTitle>
        </DialogHeader>
        <ul className="my-4 space-y-6">
          <li className="flex items-start space-x-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              1
            </span>
            <p className="text-sm">
              Challenging this {type} costs {formatEther(challengeSubmissionCost)} {token.symbol}{" "}
              and will kick off a voting period.
            </p>
          </li>
          <li className="flex items-start space-x-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              2
            </span>
            <p className="text-sm">
              &quot;{token.name}&quot; ({token.symbol}) holders anonymously vote on whether the{" "}
              {type} should be accepted or not.
            </p>
          </li>
          <li className="flex items-start space-x-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              3
            </span>
            <div>
              <p className="text-sm">
                You lose your payment if your challenge is rejected by {token.name} voters. If the
                challenge is successful, you are paid the applicant&apos;s bond of{" "}
                {formatEther(addItemCost - arbitrationCost)} {token.symbol} and are repaid your
                challenge fee.
              </p>
              <p className="mt-4 text-sm">
                Your {token.symbol} balance: {formatEther(token.balance)} (
                {formatEther(token.allowance)} approved)
              </p>
            </div>
          </li>
        </ul>
        <div className="flex justify-end space-x-2">
          {!hasEnoughBalance && (
            <SwapTokenButton
              text={`Buy ${token.symbol} to challenge`}
              extraInfo="challenge"
              flow={flow}
              defaultTokenAmount={challengeSubmissionCost}
            />
          )}
          {hasEnoughBalance && (
            <Button
              disabled={token.isApproving || isLoading}
              loading={token.isApproving || isLoading}
              type="button"
              onClick={async () => {
                if (!hasEnoughAllowance) {
                  return token.approve(challengeSubmissionCost)
                }

                try {
                  await prepareWallet()

                  const evidence = "" // Currently not used

                  writeContract({
                    address: getEthAddress(flow.tcr),
                    abi: [...flowTcrImplAbi, ...erc20VotesArbitratorImplAbi],
                    functionName: "challengeRequest",
                    args: [grant.id as Address, evidence],
                    chainId: base.id,
                  })
                } catch (e: any) {
                  toast.error(e.message, { id: toastId })
                }
              }}
            >
              {!hasEnoughAllowance && "Approve and "} Challenge
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
