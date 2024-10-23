import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import pluralize from "pluralize"

interface Props {
  flow: {
    isFlow: number
    monthlyOutgoingFlowRate: string
    monthlyIncomingFlowRate: string
  }
  approvedGrants?: number
  display: string
}

export const MonthlyBudget = ({ flow, approvedGrants, display }: Props) => {
  const isGoingNegative =
    Number(flow.monthlyOutgoingFlowRate) > Number(flow.monthlyIncomingFlowRate)

  const isNotStreamingEnough =
    flow.isFlow &&
    Number(flow.monthlyIncomingFlowRate) * 0.99 > Number(flow.monthlyOutgoingFlowRate)

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
              Splitting <Currency>{Number(flow.monthlyOutgoingFlowRate)}</Currency>/mo between{" "}
              {approvedGrants} {pluralize("builders", approvedGrants)} every second.
            </>
          ) : (
            <>
              Splitting <Currency>{Number(flow.monthlyOutgoingFlowRate)}</Currency>/mo between
              builders.
            </>
          )}
        </>
      </TooltipContent>
    </Tooltip>
  )
}
