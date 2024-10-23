import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import pluralize from "pluralize"

interface Props {
  isGoingNegative: boolean
  flow: {
    isFlow: number
    monthlyOutgoingFlowRate: string
    monthlyIncomingFlowRate: string
  }
  approvedGrants?: number
  display: string
}

export const MonthlyBudget = ({ isGoingNegative, flow, approvedGrants, display }: Props) => {
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
