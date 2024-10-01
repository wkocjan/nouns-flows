"use client"

import { Button } from "@/components/ui/button"
import { erc20VotesArbitratorImplAbi, erc20VotesMintableImplAbi, flowTcrImplAbi, nounsFlowImplAbi } from "@/lib/abis"
import { canDisputeBeExecuted } from "@/lib/database/helpers/application"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Grant, Dispute } from "@prisma/client"
import { useRouter } from "next/navigation"
import { base } from "viem/chains"

interface Props {
  flow: Grant
  dispute: Dispute
}

export function ApplicationExecuteDisputeButton(props: Props) {
  const { dispute, flow } = props
  const router = useRouter()

  const { writeContract, prepareWallet } = useContractTransaction({
    onSuccess: async () => {
      router.push(`/flow/${flow.id}`)
    },
  })

  return (
    <Button
      type="button"
      disabled={!canDisputeBeExecuted(dispute)}
      variant="secondary"
      onClick={async () => {
        await prepareWallet()

        writeContract({
          address: getEthAddress(flow.arbitrator),
          abi: [...erc20VotesArbitratorImplAbi, ...erc20VotesMintableImplAbi, ...flowTcrImplAbi, ...nounsFlowImplAbi],
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
