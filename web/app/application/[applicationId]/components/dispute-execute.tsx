"use client"

import { Button } from "@/components/ui/button"
import { erc20VotesArbitratorImplAbi } from "@/lib/abis"
import { canDisputeBeExecuted } from "@/lib/database/helpers/application"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Dispute, Grant } from "@prisma/client"
import { useRouter } from "next/navigation"
import { base } from "viem/chains"

interface Props {
  flow: Grant
  dispute: Dispute
  className?: string
}

export function ApplicationExecuteDisputeButton(props: Props) {
  const { dispute, flow, className } = props
  const router = useRouter()

  const { writeContract, prepareWallet } = useContractTransaction({
    onSuccess: async () => {
      router.push(`/flow/${flow.id}`)
    },
  })

  return (
    <Button
      className={className}
      type="button"
      disabled={!canDisputeBeExecuted(dispute)}
      variant="secondary"
      onClick={async () => {
        await prepareWallet()

        writeContract({
          address: getEthAddress(flow.arbitrator),
          abi: erc20VotesArbitratorImplAbi,
          functionName: "executeRuling",
          args: [BigInt(dispute.disputeId)],
          chainId: base.id,
        })
      }}
    >
      Execute
    </Button>
  )
}
