"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { VotingToggle } from "./voting-toggle"
import { SwapTokenButton } from "@/app/token/swap-token-button"
import { Grant } from "@prisma/client"

interface Props {
  flowId: string
  flow: Grant
  isTopLevel: boolean
}

export const FlowSubmenu = (props: Props) => {
  const { flowId, isTopLevel, flow } = props

  const segment = useSelectedLayoutSegment()

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
        {isApproved && <VotingToggle />}
        {(isDrafts || isApplications) && (
          <div className="flex items-center space-x-2">
            <Link href={`/apply/${flowId}`}>
              <Button variant="secondary">
                {isTopLevel ? "Suggest category" : "Apply for a grant"}
              </Button>
            </Link>
            <SwapTokenButton flow={flow} defaultTokenAmount={BigInt(1e18)} />
          </div>
        )}
      </div>
    </div>
  )
}
