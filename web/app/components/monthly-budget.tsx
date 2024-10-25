import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import pluralize from "pluralize"
import { Grant } from "@prisma/client"

interface Props {
  flow: Pick<
    Grant,
    | "isFlow"
    | "monthlyOutgoingFlowRate"
    | "monthlyIncomingFlowRate"
    | "monthlyIncomingBaselineFlowRate"
    | "monthlyIncomingBonusFlowRate"
    | "monthlyBaselinePoolFlowRate"
    | "monthlyBonusPoolFlowRate"
    | "baselineMemberUnits"
    | "bonusMemberUnits"
  >
  approvedGrants?: number
  display: string
  multiplyBy?: number
}

export const MonthlyBudget = ({ flow, approvedGrants, display, multiplyBy }: Props) => {
  const monthlyOutgoingFlowRate = multiplyBy
    ? Number(flow.monthlyOutgoingFlowRate) * multiplyBy
    : Number(flow.monthlyOutgoingFlowRate)
  const monthlyIncomingFlowRate = multiplyBy
    ? Number(flow.monthlyIncomingFlowRate) * multiplyBy
    : Number(flow.monthlyIncomingFlowRate)
  const isFlow = flow.isFlow

  const isGoingNegative = monthlyOutgoingFlowRate > monthlyIncomingFlowRate

  const isNotStreamingEnough = isFlow && monthlyIncomingFlowRate * 0.99 > monthlyOutgoingFlowRate

  const absDifference = Math.abs(monthlyOutgoingFlowRate - monthlyIncomingFlowRate)
  const isGoingNegativeSignificant =
    isGoingNegative && absDifference / monthlyOutgoingFlowRate > 0.001

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={isGoingNegative ? "warning" : "default"}>
          <Currency>{Number(display) * (multiplyBy || 1)}</Currency>
          /mo
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <>
          {isGoingNegative ? (
            <>
              Warning: More outgoing funds than incoming.{" "}
              <Currency>{monthlyOutgoingFlowRate}</Currency> vs{" "}
              <Currency>{monthlyIncomingFlowRate}</Currency>.
              {isGoingNegativeSignificant && (
                <>
                  <br /> This will be automatically fixed within 1 minute.
                </>
              )}
            </>
          ) : isNotStreamingEnough ? (
            <>
              Warning: Not streaming enough funds. <Currency>{monthlyIncomingFlowRate}</Currency> vs{" "}
              <Currency>{monthlyOutgoingFlowRate}</Currency>.
              {isGoingNegativeSignificant && (
                <>
                  <br /> This will be automatically fixed within 1 minute.
                </>
              )}
            </>
          ) : approvedGrants ? (
            <>
              Streaming <Currency>{monthlyOutgoingFlowRate}</Currency>/mo to {approvedGrants}{" "}
              {pluralize("builder", approvedGrants)}.
            </>
          ) : isFlow ? (
            <>
              Streaming <Currency>{monthlyOutgoingFlowRate}</Currency>/mo to builders.
            </>
          ) : (
            <>
              <Currency>{Number(flow.monthlyIncomingBaselineFlowRate)}</Currency>/mo baseline grant.
              <br />
              <Currency>{Number(flow.monthlyIncomingBonusFlowRate)}</Currency>/mo as a bonus from
              voters.
            </>
          )}
        </>
      </TooltipContent>
    </Tooltip>
  )
}
