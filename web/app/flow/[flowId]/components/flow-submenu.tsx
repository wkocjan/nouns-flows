"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { VotingToggle } from "./voting-toggle"

interface Props {
  flowId: string
  awaitingCount: number
}

export const FlowSubmenu = (props: Props) => {
  const { flowId, awaitingCount } = props

  const segment = useSelectedLayoutSegment()

  const isApproved = segment === null
  const isCandidates = segment === "candidates"
  const isDrafts = segment === "drafts"

  return (
    <div className="mb-4 mt-10 flex items-center justify-between">
      <div className="flex min-h-9 items-center space-x-5 md:space-x-7">
        <Link
          href={`/flow/${flowId}`}
          className="group flex items-center space-x-2 text-lg font-semibold md:text-xl"
        >
          <span
            className={cn({
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100":
                !isApproved,
            })}
          >
            Approved
          </span>
        </Link>
        <Link
          className="group flex items-center space-x-2 text-lg font-semibold md:text-xl"
          href={`/flow/${flowId}/candidates`}
        >
          <span
            className={cn({
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100":
                !isCandidates,
            })}
          >
            Awaiting
          </span>{" "}
          <Badge variant="default" className="rounded-full">
            {awaitingCount}
          </Badge>
        </Link>
        <Link
          className="group flex items-center space-x-2 text-lg font-semibold md:text-xl"
          href={`/flow/${flowId}/drafts`}
        >
          <span
            className={cn({
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100":
                !isDrafts,
            })}
          >
            Drafts
          </span>{" "}
        </Link>
      </div>

      {isApproved && <VotingToggle />}
    </div>
  )
}
