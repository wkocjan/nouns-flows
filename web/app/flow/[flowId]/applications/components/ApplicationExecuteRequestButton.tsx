"use client"

import { Button } from "@/components/ui/button"
import { flowTcrImplAbi } from "@/lib/abis"
import { canRequestBeExecuted } from "@/lib/database/helpers/application"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Grant } from "@prisma/client"
import { Address } from "viem"
import { base } from "viem/chains"

interface Props {
  grant: Grant
  flow: Grant
}

export function ApplicationExecuteRequestButton(props: Props) {
  const { grant, flow } = props
  const { writeContract, prepareWallet } = useContractTransaction()

  return (
    <Button
      type="button"
      disabled={!canRequestBeExecuted(grant)}
      variant="secondary"
      onClick={async () => {
        await prepareWallet()

        writeContract({
          address: getEthAddress(flow.tcr),
          abi: flowTcrImplAbi,
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
