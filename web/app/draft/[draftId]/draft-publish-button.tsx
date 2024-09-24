"use client"

import { Button } from "@/components/ui/button"
import { flowTcrAddress, flowTcrImplAbi } from "@/lib/abis"
import { useTcrToken } from "@/lib/tcr/use-tcr-token"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Draft, Grant } from "@prisma/client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { encodeAbiParameters } from "viem"
import { base } from "viem/chains"
import { useAccount, useReadContract } from "wagmi"

interface Props {
  draft: Draft & { flow: Grant }
}

const chainId = base.id

export function DraftPublishButton(props: Props) {
  const { draft } = props
  const { address } = useAccount()
  const [text, setText] = useState("Sponsor")

  const isOwner = draft.users.some((user) => user.toLowerCase() === address?.toLowerCase())

  const { prepareWallet, writeContract, toastId } = useContractTransaction({
    chainId,
    onSuccess: console.debug,
  })

  const { data: submissionBaseDeposit } = useReadContract({
    abi: flowTcrImplAbi,
    address: flowTcrAddress[8453],
    functionName: "submissionBaseDeposit",
    chainId,
  })

  const token = useTcrToken(getEthAddress(draft.flow.erc20), getEthAddress(draft.flow.tcr))

  useEffect(() => {
    setText(isOwner ? "Publish" : "Sponsor")
  }, [isOwner])

  return (
    <Button
      type="button"
      onClick={async () => {
        try {
          await prepareWallet()

          if (!submissionBaseDeposit)
            throw new Error("Couldn't read the submission deposit.Please reload the page")

          if (token.balance < submissionBaseDeposit) {
            throw new Error("Not enough tokens")
          }

          if (token.allowance < submissionBaseDeposit) {
            return await token.approve(submissionBaseDeposit)
          }

          writeContract({
            account: address,
            abi: flowTcrImplAbi,
            functionName: "addItem",
            address: flowTcrAddress[8453],
            chainId,
            args: [
              encodeAbiParameters(
                [
                  { name: "recipient", type: "address" },
                  {
                    name: "metadata",
                    type: "tuple",
                    components: [
                      { name: "title", type: "string" },
                      { name: "description", type: "string" },
                      { name: "image", type: "string" },
                      { name: "tagline", type: "string" },
                      { name: "url", type: "string" },
                    ],
                  },
                  { name: "recipientType", type: "uint8" },
                ],
                [
                  getEthAddress(draft.users[0]),
                  {
                    title: draft.title,
                    description: draft.description,
                    image: draft.image,
                    tagline: "",
                    url: "",
                  },
                  1, // 1 flow
                ],
              ),
            ],
          })
        } catch (e: any) {
          toast.error(e.message, { id: toastId })
        }
      }}
    >
      {text}
    </Button>
  )
}
