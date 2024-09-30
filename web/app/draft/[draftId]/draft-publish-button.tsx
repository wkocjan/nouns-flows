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
import { RecipientType } from "@/lib/enums"
import { useTcrData } from "@/lib/tcr/use-tcr-data"
import { useTcrToken } from "@/lib/tcr/use-tcr-token"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Draft, Grant } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { encodeAbiParameters, formatEther, zeroAddress } from "viem"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { updateDraft } from "./update-draft"

interface Props {
  draft: Draft
  flow: Grant
}

const chainId = base.id

export function DraftPublishButton(props: Props) {
  const { draft, flow } = props
  const { address } = useAccount()
  const router = useRouter()
  const ref = useRef<HTMLButtonElement>(null)

  const { addItemCost, challengePeriodFormatted } = useTcrData(getEthAddress(flow.tcr), chainId)
  const token = useTcrToken(getEthAddress(flow.erc20), getEthAddress(flow.tcr), chainId)

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Draft published!",
    onSuccess: async (hash) => {
      await updateDraft(draft.id, hash)
      ref.current?.click() // close dialog
      router.push(`/flow/${flow.id}/applications`)
    },
  })

  const isOwner = draft.users.some((user) => user.toLowerCase() === address?.toLowerCase())
  const [action, setAction] = useState("Sponsor")

  useEffect(() => {
    setAction(isOwner ? "Apply" : "Sponsor")
  }, [isOwner])

  const hasEnoughBalance = token.balance >= addItemCost
  const hasEnoughAllowance = token.allowance >= addItemCost

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" ref={ref}>
          {action}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">
            {action} &quot;{draft.title}&quot; {draft.isFlow ? "Category" : "Grant"}
          </DialogTitle>
        </DialogHeader>
        <ul className="my-4 space-y-6">
          <li className="flex items-start space-x-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              1
            </span>
            <p>Applying will kick off the challenge period.</p>
          </li>
          <li className="flex items-start space-x-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              2
            </span>
            <p>
              For {challengePeriodFormatted}, anyone can pay an equivalent bond and challenge this
              submission. If not challenged, your item will be accepted.
            </p>
          </li>
          <li className="flex items-start space-x-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              3
            </span>
            <div>
              <p>
                Applying costs {formatEther(addItemCost)} {token.symbol}. You may lose this amount
                if your submission is challenged and rejected.
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
                return token.approve(addItemCost)
              }

              try {
                await prepareWallet()

                writeContract({
                  account: address,
                  abi: flowTcrImplAbi,
                  functionName: "addItem",
                  address: getEthAddress(flow.tcr),
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
                        draft.isFlow ? zeroAddress : getEthAddress(draft.users[0]),
                        {
                          title: draft.title,
                          description: draft.description,
                          image: draft.image,
                          tagline: "",
                          url: "",
                        },
                        draft.isFlow ? RecipientType.FlowContract : RecipientType.ExternalAccount,
                      ],
                    ),
                  ],
                })
              } catch (e: any) {
                toast.error(e.message, { id: toastId })
              }
            }}
          >
            {!hasEnoughAllowance && "Approve and "} {action}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
