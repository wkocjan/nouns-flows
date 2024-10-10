import { Badge } from "./badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

export const GrantStatusCountBadges = ({
  challengedCount,
  awaitingCount,
  approvedCount,
  hideChallenged,
}: {
  challengedCount: number
  awaitingCount: number
  approvedCount?: number
  hideChallenged?: boolean
}) => {
  return (
    <div className="flex items-center justify-center space-x-1">
      {(approvedCount || 0) > 0 && (
        <GrantCountWithTooltip count={approvedCount || 0} type="approved" />
      )}
      {!hideChallenged && <GrantCountWithTooltip count={challengedCount} type="challenged" />}
      <GrantCountWithTooltip count={awaitingCount} type="awaiting" />
    </div>
  )
}

const GrantCountBadge = ({
  count,
  type,
}: {
  count: number
  type: "approved" | "challenged" | "awaiting"
}) => {
  return (
    <Badge
      variant={type === "approved" ? "success" : type === "challenged" ? "warning" : "outline"}
    >
      {count}
    </Badge>
  )
}

const GrantCountWithTooltip = ({
  count,
  type,
}: {
  count: number
  type: "approved" | "challenged" | "awaiting"
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <GrantCountBadge count={count} type={type} />
      </TooltipTrigger>
      <TooltipContent className="capitalize">{type}</TooltipContent>
    </Tooltip>
  )
}
