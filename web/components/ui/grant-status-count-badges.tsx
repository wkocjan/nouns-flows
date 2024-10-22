import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { isGrantApproved, isGrantAwaiting, isGrantChallenged } from "@/lib/utils"
import { Grant } from "@prisma/client"
import Link from "next/link"

interface Props {
  subgrants: Grant[]
  alwaysShowAll?: boolean
  isTopLevel?: boolean
  showLabel?: boolean
}

export const GrantStatusCountBadges = (props: Props) => {
  const { subgrants, alwaysShowAll = false, isTopLevel = false, showLabel = false } = props

  const parentContract = subgrants[0]?.parentContract

  const approved = subgrants.filter((g) => isGrantApproved(g)).length
  const challenged = subgrants.filter((g) => isGrantChallenged(g)).length
  const awaiting = subgrants.filter((g) => isGrantAwaiting(g)).length

  const label = showLabel ? (isTopLevel ? "flows" : "grants") : ""

  return (
    <div className="flex items-center justify-center space-x-1">
      {(approved > 0 || alwaysShowAll) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/flow/${parentContract}`}>
              <Badge variant="success">{approved}</Badge>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Approved {label}</TooltipContent>
        </Tooltip>
      )}
      {challenged > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/flow/${parentContract}`}>
              <Badge variant="warning">{challenged}</Badge>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Challenged {label} </TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/flow/${parentContract}/applications`}>
            <Badge variant="outline">{awaiting}</Badge>
          </Link>
        </TooltipTrigger>
        <TooltipContent>Awaiting {label}</TooltipContent>
      </Tooltip>
    </div>
  )
}
