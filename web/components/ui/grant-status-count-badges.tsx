import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { isGrantApproved, isGrantAwaiting, isGrantChallenged } from "@/lib/utils"
import { Grant } from "@prisma/client"

interface Props {
  subgrants: Grant[]
  alwaysShowAll?: boolean
  isTopLevel?: boolean
  showLabel?: boolean
}

export const GrantStatusCountBadges = (props: Props) => {
  const { subgrants, alwaysShowAll = false, isTopLevel = false, showLabel = false } = props

  const approved = subgrants.filter((g) => isGrantApproved(g)).length
  const challenged = subgrants.filter((g) => isGrantChallenged(g)).length
  const awaiting = subgrants.filter((g) => isGrantAwaiting(g)).length

  const label = showLabel ? (isTopLevel ? "flows" : "grants") : ""

  return (
    <div className="flex items-center justify-center space-x-1">
      {(approved > 0 || alwaysShowAll) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="success">{approved}</Badge>
          </TooltipTrigger>
          <TooltipContent>Approved {label}</TooltipContent>
        </Tooltip>
      )}
      {(challenged > 0 || alwaysShowAll) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="warning">{challenged}</Badge>
          </TooltipTrigger>
          <TooltipContent>Challenged {label} </TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline">{awaiting}</Badge>
        </TooltipTrigger>
        <TooltipContent>Awaiting {label}</TooltipContent>
      </Tooltip>
    </div>
  )
}
