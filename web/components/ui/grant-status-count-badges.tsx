import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Grant } from "@prisma/flows/edge"
import Link from "next/link"

interface Props {
  id: string
  subgrants: Grant[]
  flow: Pick<Grant, "activeRecipientCount" | "awaitingRecipientCount" | "challengedRecipientCount">
  alwaysShowAll?: boolean
  isTopLevel?: boolean
  showLabel?: boolean
}

export const GrantStatusCountBadges = (props: Props) => {
  const {
    alwaysShowAll = false,
    isTopLevel = false,
    showLabel = false,
    id,
    flow,
    subgrants,
  } = props

  const approved = isTopLevel
    ? subgrants?.reduce((acc, grant) => acc + grant.activeRecipientCount, 0) || 0
    : flow.activeRecipientCount
  const challenged = isTopLevel
    ? subgrants?.reduce((acc, grant) => acc + grant.challengedRecipientCount, 0) || 0
    : flow.challengedRecipientCount
  const awaiting = isTopLevel
    ? subgrants?.reduce((acc, grant) => acc + grant.awaitingRecipientCount, 0) || 0
    : flow.awaitingRecipientCount

  const label = showLabel ? "grants" : ""

  return (
    <div className="flex items-center justify-center space-x-1">
      {(approved > 0 || alwaysShowAll) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link tabIndex={-1} href={`/flow/${id}`}>
              <Badge variant="success">{approved}</Badge>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Approved {label}</TooltipContent>
        </Tooltip>
      )}
      {challenged > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link tabIndex={-1} href={`/flow/${id}`}>
              <Badge variant="warning">{challenged}</Badge>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Challenged {label} </TooltipContent>
        </Tooltip>
      )}
      {(awaiting > 0 || alwaysShowAll) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link tabIndex={-1} href={`/flow/${id}/applications`}>
              <Badge variant="secondary">{awaiting}</Badge>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Awaiting {label}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
