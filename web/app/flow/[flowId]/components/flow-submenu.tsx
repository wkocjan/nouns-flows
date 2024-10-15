"use client"

import { Button } from "@/components/ui/button"
import { cn, getEthAddress } from "@/lib/utils"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { VotingToggle } from "./voting-toggle"
import { SwapTokenButton } from "@/app/token/swap-token-button"
import { Grant } from "@prisma/client"
import { useAccount } from "wagmi"
import { useERC20Balances } from "@/lib/tcr/use-erc20-balances"

interface Props {
  flowId: string
  flow: Grant
  isTopLevel: boolean
}

export const FlowSubmenu = (props: Props) => {
  const { flowId, isTopLevel, flow } = props

  const segment = useSelectedLayoutSegment()
  const { address } = useAccount()
  const { balances } = useERC20Balances([getEthAddress(flow.erc20)], address)

  const isApproved = segment === null
  const isApplications = segment === "applications"
  const isDrafts = segment === "drafts"

  return (
    <div className="mb-4 mt-10 flex items-center justify-between">
      <div className="flex min-h-9 items-center space-x-6 md:space-x-7">
        <Link
          href={`/flow/${flowId}`}
          className="group flex items-center space-x-2 text-lg font-medium md:text-xl"
        >
          <span
            className={cn({
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100": !isApproved,
            })}
          >
            Approved
          </span>
        </Link>
        <Link
          className="group flex items-center space-x-2 text-lg font-medium md:text-xl"
          href={`/flow/${flowId}/applications`}
        >
          <span
            className={cn({
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100": !isApplications,
            })}
          >
            Applications
          </span>
        </Link>
        <Link
          className="group flex items-center space-x-2 text-lg font-medium md:text-xl"
          href={`/flow/${flowId}/drafts`}
        >
          <span
            className={cn({
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100": !isDrafts,
            })}
          >
            Drafts
          </span>
        </Link>
      </div>

      <div className="max-sm:hidden">
        <div className="flex items-center space-x-2">
          <SwapTokenButton
            text={balances?.[0] ? (!isTopLevel ? "Buy $TCR" : "Buy $FLOWS") : "Become curator"}
            flow={flow}
            extraInfo="curator"
            variant="secondary"
            defaultTokenAmount={BigInt(1e18)}
          />
          {isApproved && <VotingToggle />}
          {(isDrafts || isApplications) && (
            <Link href={`/apply/${flowId}`}>
              <Button>{isTopLevel ? "Suggest flow" : "Apply for a grant"}</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
