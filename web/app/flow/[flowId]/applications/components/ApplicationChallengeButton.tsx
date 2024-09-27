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
import { useRef } from "react"
import { toast } from "sonner"
import { Address } from "viem"
import { base } from "viem/chains"

interface Props {
  grant: Grant
  flow: Grant
}

export function ApplicationChallengeButton(props: Props) {
  const { grant, flow } = props
  const { writeContract, prepareWallet, isLoading, toastId } = useContractTransaction({
    onSuccess: async () => {
      ref.current?.click() // close dialog
    },
  })
  const ref = useRef<HTMLButtonElement>(null)

  const { challengeSubmissionCost } = useTcrData(getEthAddress(flow.tcr))
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
        <p>Description</p>
        <div className="flex justify-end space-x-2">
          <Button
            variant={hasEnoughBalance ? "outline" : "default"}
            type="button"
            onClick={() => window.alert("Coming soon!")}
          >
            Buy {token.symbol}
          </Button>
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
