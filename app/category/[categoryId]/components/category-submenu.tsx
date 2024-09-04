"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { VotingToggle } from "./voting-toggle"

interface Props {
  categoryId: string
  awaitingCount: number
}

export const CategorySubmenu = (props: Props) => {
  const { categoryId, awaitingCount } = props

  const segment = useSelectedLayoutSegment()

  const isCandidates = segment === "candidates"

  return (
    <div className="mb-4 mt-10 flex items-center justify-between">
      <div className="flex min-h-9 items-center space-x-7">
        <Link
          href={`/category/${categoryId}`}
          className="group flex items-center space-x-2 text-xl font-semibold"
        >
          <span
            className={cn({
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100":
                isCandidates,
            })}
          >
            Approved Grants
          </span>
        </Link>
        <Link
          className="group flex items-center space-x-2 text-xl font-semibold"
          href={`/category/${categoryId}/candidates`}
        >
          <span
            className={cn({
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100":
                !isCandidates,
            })}
          >
            Awaiting Submissions
          </span>{" "}
          <Badge variant="default" className="rounded-full">
            {awaitingCount}
          </Badge>
        </Link>
      </div>

      {!isCandidates && <VotingToggle />}
    </div>
  )
}
