"use client"

import { SwapTokenButton } from "@/app/token/swap-token-button"
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
import { DerivedData, Draft, Grant } from "@prisma/client"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { encodeAbiParameters, formatEther, zeroAddress } from "viem"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { publishDraft } from "./publish-draft"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Currency } from "@/components/ui/currency"

interface Props {
  draft: Draft
  flow: Grant & { derivedData: DerivedData | null }
  size?: "default" | "sm"
}

const chainId = base.id

export function DraftPublishButton(props: Props) {
  const { draft, flow, size = "default" } = props
  const { address } = useAccount()
  const router = useRouter()
  const ref = useRef<HTMLButtonElement>(null)
  const { login } = usePrivy()

  const { addItemCost, challengePeriodFormatted } = useTcrData(getEthAddress(flow.tcr), chainId)
  const token = useTcrToken(getEthAddress(flow.erc20), getEthAddress(flow.tcr), chainId)

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Draft published!",
    onSuccess: async (hash) => {
      await publishDraft(draft.id, hash)
      ref.current?.click() // close dialog
      // wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push(`/flow/${flow.id}/applications`)
    },
  })

  const isOwner = draft.users.some((user) => user.toLowerCase() === address?.toLowerCase())
  const [action, setAction] = useState("Publish")

  useEffect(() => {
    setAction(isOwner ? "Publish" : "Sponsor")
  }, [isOwner])

  const hasEnoughBalance = token.balance >= addItemCost
  const hasEnoughAllowance = token.allowance >= addItemCost
  const currentMinimumSalary =
    Number(flow.monthlyBaselinePoolFlowRate) /
    Number(
      flow.activeRecipientCount + flow.awaitingRecipientCount - flow.challengedRecipientCount + 1,
    )
  const canPublish = Number(flow.derivedData?.minimumSalary || "0") <= currentMinimumSalary

  return (
    <Dialog>
      <DialogTrigger asChild>
        {!canPublish ? (
          <DisabledPublishButton action={action} size={size} />
        ) : (
          <Button
            type="button"
            onClick={(e) => {
              if (!address) {
                e.preventDefault()
                login()
              }
            }}
            disabled={!canPublish}
            ref={ref}
            size={size}
          >
            {action}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">
            {action} &quot;{draft.title}&quot; {draft.isFlow ? "Flow" : "Grant"}
          </DialogTitle>
        </DialogHeader>
        <ul className="my-4 space-y-6">
          <li className="flex items-start space-x-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              1
            </span>
            <p>
              Applying costs {formatEther(addItemCost)} {token.symbol} and will kick off a challenge
              period.
            </p>
          </li>
          <li className="flex items-start space-x-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              2
            </span>
            <p>
              For {challengePeriodFormatted}, anyone can pay to challenge this application and send
              it to a community vote. You may lose your application fee if the application is voted
              down by the community.
            </p>
          </li>
          <li className="flex items-start space-x-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              3
            </span>
            <div>
              <p>
                If not challenged, your application will be accepted and your application fee will
                be returned.
              </p>
              <p className="mt-2.5 text-sm text-muted-foreground">
                Your {token.symbol} balance: {formatEther(token.balance)} (
                {formatEther(token.allowance)} approved)
              </p>
            </div>
          </li>
        </ul>
        <div className="flex justify-end space-x-2">
          {!hasEnoughBalance && (
            <SwapTokenButton
              text={`Buy ${token.symbol} to apply`}
              onSuccess={() => {
                token.refetch()
              }}
              extraInfo="apply"
              flow={flow}
              defaultTokenAmount={addItemCost - token.balance}
            />
          )}
          {hasEnoughBalance && (
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
                            tagline: draft.tagline || "",
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const CantPublishTooltip = () => {
  return (
    <TooltipContent className="text-center">
      This flow is not accepting new grants.
      <br />
      Please check back soon.
      <br />
    </TooltipContent>
  )
}

const DisabledPublishButton = ({ action, size }: { action: string; size?: "default" | "sm" }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button disabled size={size}>
          {action}
        </Button>
      </TooltipTrigger>
      <CantPublishTooltip />
    </Tooltip>
  )
}
