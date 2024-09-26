"use client"

import { Button } from "@/components/ui/button"
import { flowTcrImplAbi } from "@/lib/abis"
import { canBeExecuted } from "@/lib/database/helpers/application"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Application, Grant } from "@prisma/client"
import { Address } from "viem"
import { base } from "viem/chains"

interface Props {
  application: Application
  flow: Grant
}

export function ApplicationExecuteButton(props: Props) {
  const { application, flow } = props
  const { writeContract, prepareWallet } = useContractTransaction()

  return (
    <Button
      type="button"
      disabled={!canBeExecuted(application)}
      onClick={async () => {
        await prepareWallet()

        writeContract({
          address: getEthAddress(flow.tcr),
          abi: flowTcrImplAbi,
          functionName: "executeRequest",
          args: [application.id as Address],
          chainId: base.id,
        })
      }}
    >
      Execute
    </Button>
  )
}
