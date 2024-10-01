"use client"

import { Button } from "@/components/ui/button"
import {  erc20VotesMintableImplAbi, flowTcrImplAbi, nounsFlowImplAbi } from "@/lib/abis"
import { canRequestBeExecuted } from "@/lib/database/helpers/application"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Grant } from "@prisma/client"
import { Address } from "viem"
import { base } from "viem/chains"

interface Props {
  grant: Grant
  flow: Grant
  className?: string
}

export function ApplicationExecuteRequestButton(props: Props) {
  const { grant, flow, className } = props
  const { writeContract, prepareWallet } = useContractTransaction()

  return (
    <Button
      type="button"
      disabled={!canRequestBeExecuted(grant)}
      variant="secondary"
      className={className}
      onClick={async () => {
        await prepareWallet()

        writeContract({
          address: getEthAddress(flow.tcr),
          abi: [...flowTcrImplAbi, ...nounsFlowImplAbi, ...erc20VotesMintableImplAbi],
          functionName: "executeRequest",
          args: [grant.id as Address],
          chainId: base.id,
        })
      }}
    >
      Execute
    </Button>
  )
}
