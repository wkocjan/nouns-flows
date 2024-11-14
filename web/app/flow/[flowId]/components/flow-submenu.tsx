"use client"

import { SwapTokenButton } from "@/app/token/swap-token-button"
import { Button } from "@/components/ui/button"
import { isGrantApproved, isGrantAwaiting } from "@/lib/database/helpers"
import { useERC20Balances } from "@/lib/tcr/use-erc20-balances"
import { cn, getEthAddress } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { useAccount } from "wagmi"
import { VotingToggle } from "./voting-toggle"

interface Props {
  flowId: string
  flow: Grant
  grants: Grant[]
  isTopLevel: boolean
  draftsCount: number
}

export const FlowSubmenu = (props: Props) => {
  const { flowId, isTopLevel, flow, grants, draftsCount } = props

  const segment = useSelectedLayoutSegment()
  const { address } = useAccount()
  const { balances } = useERC20Balances([getEthAddress(flow.erc20)], address)

  const isApproved = segment === null
  const isApplications = segment === "applications"
  const isDrafts = segment === "drafts"

  const approvedCount = grants.filter(isGrantApproved).length
  const awaitingCount = grants.filter(isGrantAwaiting).length

  return (
    <div className="mb-4 mt-10 flex items-center justify-between">
      <div className="flex min-h-9 items-center space-x-5 md:space-x-7">
        <Link
          href={`/flow/${flowId}`}
          className="group flex items-center space-x-2 text-base font-medium md:text-xl"
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
          className="group flex items-start space-x-1 text-base font-medium md:text-xl"
          href={`/flow/${flowId}/applications`}
        >
          <span
            className={cn("flex items-start", {
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100": !isApplications,
            })}
          >
            Applications
          </span>
          {awaitingCount > 0 && (
            <span className="ml-1 inline-flex size-[18px] items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
              {awaitingCount}
            </span>
          )}
        </Link>
        <Link
          className="group flex items-start space-x-1 text-base font-medium md:text-xl"
          href={`/flow/${flowId}/drafts`}
        >
          <span
            className={cn({
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100": !isDrafts,
            })}
          >
            Drafts
          </span>
          {draftsCount > 0 && (
            <span className="ml-1 inline-flex size-[18px] items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
              {draftsCount}
            </span>
          )}
        </Link>
      </div>

      <div className="max-sm:hidden">
        <div className="flex items-center space-x-2">
          <SwapTokenButton
            text={balances?.[0] ? (!isTopLevel ? "Buy TCR" : "Buy FLOWS") : "Become curator"}
            flow={flow}
            extraInfo="curator"
            variant="secondary"
            defaultTokenAmount={BigInt(1e18)}
          />
          {isApproved && approvedCount > 0 && <VotingToggle />}
          {(isDrafts || isApplications || (isApproved && approvedCount === 0)) && (
            <Link href={`/apply/${flowId}`}>
              <Button>{isTopLevel ? "Suggest flow" : "Apply for a grant"}</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
