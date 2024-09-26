"use client"

import { Button } from "@/components/ui/button"
import { flowTcrImplAbi } from "@/lib/abis"
import { canBeChallenged } from "@/lib/database/helpers/application"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Application, Grant } from "@prisma/client"
import { Address } from "viem"
import { base } from "viem/chains"

interface Props {
  application: Application
  flow: Grant
}

export function ApplicationChallengeButton(props: Props) {
  const { application, flow } = props
  const { writeContract, prepareWallet } = useContractTransaction()

  return (
    <Button
      type="button"
      disabled={!canBeChallenged(application)}
      onClick={async () => {
        await prepareWallet()

        const evidence = "" // Currently not used

        writeContract({
          address: getEthAddress(flow.tcr),
          abi: flowTcrImplAbi,
          functionName: "challengeRequest",
          args: [application.id as Address, evidence],
          chainId: base.id,
        })
      }}
    >
      Challenge
    </Button>
  )
}
