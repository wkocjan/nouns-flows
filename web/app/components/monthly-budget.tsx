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
}

export const MonthlyBudget = ({ flow, approvedGrants, display }: Props) => {
  const isFlow = flow.isFlow

  const isGoingNegative =
    Number(flow.monthlyOutgoingFlowRate) > Number(flow.monthlyIncomingFlowRate)

  const isNotStreamingEnough =
    isFlow && Number(flow.monthlyIncomingFlowRate) * 0.99 > Number(flow.monthlyOutgoingFlowRate)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={isGoingNegative ? "warning" : "default"}>
          <Currency>{display}</Currency>
          /mo
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <>
          {isGoingNegative ? (
            <>
              Warning: More outgoing funds than incoming.{" "}
              <Currency>{Number(flow.monthlyOutgoingFlowRate)}</Currency> vs{" "}
              <Currency>{Number(flow.monthlyIncomingFlowRate)}</Currency>.
              <br /> This will be automatically fixed within 1 minute.
            </>
          ) : isNotStreamingEnough ? (
            <>
              Warning: Not streaming enough funds.{" "}
              <Currency>{Number(flow.monthlyIncomingFlowRate)}</Currency> vs{" "}
              <Currency>{Number(flow.monthlyOutgoingFlowRate)}</Currency>.
              <br /> This will be automatically fixed within 1 minute.
            </>
          ) : approvedGrants ? (
            <>
              Streaming <Currency>{Number(flow.monthlyOutgoingFlowRate)}</Currency>/mo to{" "}
              {approvedGrants} {pluralize("builder", approvedGrants)}.
            </>
          ) : isFlow ? (
            <>
              Streaming <Currency>{Number(flow.monthlyOutgoingFlowRate)}</Currency>/mo to builders.
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
