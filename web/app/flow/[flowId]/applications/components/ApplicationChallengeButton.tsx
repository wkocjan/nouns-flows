"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { flowTcrImplAbi } from "@/lib/abis"
import { canBeChallenged } from "@/lib/database/helpers/application"
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
}

export function ApplicationChallengeButton(props: Props) {
  const { grant, flow } = props
  const router = useRouter()

  const { writeContract, prepareWallet, isLoading, toastId } = useContractTransaction({
    onSuccess: async () => {
      ref.current?.click() // close dialog
      router.refresh()
    },
  })
  const ref = useRef<HTMLButtonElement>(null)

  const { challengeSubmissionCost, addItemCost, arbitrationCost } = useTcrData(
    getEthAddress(flow.tcr),
  )
  const token = useTcrToken(getEthAddress(flow.erc20), getEthAddress(flow.tcr))

  const hasEnoughBalance = token.balance >= challengeSubmissionCost
  const hasEnoughAllowance = token.allowance >= challengeSubmissionCost

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" ref={ref} disabled={!canBeChallenged(grant)}>
          Challenge
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="sm:max-w-screen-sm">
          <DialogTitle className="text-center text-lg font-medium">
            Challenge Application
          </DialogTitle>
        </DialogHeader>
        <ul className="my-4 space-y-6">
          <li className="flex items-start space-x-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              1
            </span>
            <p>
              Challenging this application costs {formatEther(challengeSubmissionCost)}{" "}
              {token.symbol} and will kick off a voting period.
            </p>
          </li>
          <li className="flex items-start space-x-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              2
            </span>
            <p>
              {token.name} holders anonymously vote on whether the application should be accepted or
              not.
            </p>
          </li>
          <li className="flex items-start space-x-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              3
            </span>
            <div>
              <p>
                You lose your payment if your challenge is rejected by {token.name} voters. If the
                challenge is successful, you are paid the applicant&apos;s bond of{" "}
                {formatEther(addItemCost - arbitrationCost)} {token.symbol} and are repaid your
                challenge fee.
              </p>
              <p className="mt-2.5 text-sm text-muted-foreground">
                Your {token.symbol} balance: {formatEther(token.balance)}
              </p>
            </div>
          </li>
        </ul>
        <div className="flex justify-end space-x-2">
          {!hasEnoughBalance && (
            <Button variant="default" type="button" onClick={() => window.alert("Coming soon!")}>
              Buy {token.symbol}
            </Button>
          )}
          <Button
            disabled={!hasEnoughBalance || token.isApproving || isLoading}
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
                  abi: flowTcrImplAbi,
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
