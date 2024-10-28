import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Currency } from "@/components/ui/currency"
import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FlowWithGrants } from "@/lib/database/queries/flow"
import { Status } from "@/lib/enums"
import { cn, explorerUrl, getEthAddress, getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { base } from "viem/chains"
import { FlowHeaderUserVotes } from "./flow-header-user-votes"

interface Props {
  flow: FlowWithGrants
}

export const FlowHeader = (props: Props) => {
  const { flow } = props
  const { isTopLevel } = flow

  return (
    <Card>
      <CardContent className="flex flex-col items-start justify-between space-y-4 p-4 md:flex-row md:items-center md:space-x-4 md:space-y-0 md:p-6">
        <div className="flex flex-col text-left md:flex-row md:items-center md:space-x-4">
          <Image
            src={getIpfsUrl(flow.image)}
            alt={flow.title}
            className="mb-2 size-16 rounded-lg object-cover md:mb-0 md:size-20"
            height="80"
            width="80"
          />
          <div>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-base font-bold md:text-xl">{flow.title}</CardTitle>
              {flow.status === Status.ClearingRequested && (
                <Link href={`/item/${flow.id}`}>
                  <Badge variant="destructive">Removal Requested</Badge>
                </Link>
              )}
            </div>
            <CardDescription className="text-sm">{flow.tagline}</CardDescription>

            {!isTopLevel && (
              <Button variant="link" size="sm" className="p-0" asChild>
                <Link href={`/item/${flow.id}`}>Read more</Link>
              </Button>
            )}
          </div>
        </div>
        <div
          className={cn("grid w-full gap-x-4 gap-y-8 text-sm md:w-auto md:shrink-0", {
            "grid-cols-2 md:grid-cols-2": isTopLevel,
            "grid-cols-2 md:grid-cols-4": !isTopLevel,
          })}
        >
          <div className="max-sm:flex max-sm:flex-col max-sm:items-start md:text-center">
            <p className="mb-1.5 text-muted-foreground">{isTopLevel ? "Flows" : "Grants"}</p>
            <GrantStatusCountBadges id={flow.id} subgrants={flow.subgrants} alwaysShowAll />
          </div>
          <div className="md:text-center">
            <p className="mb-1.5 text-muted-foreground">Budget</p>
            <Popover>
              <PopoverTrigger asChild>
                <Badge className="cursor-help">
                  <Currency>
                    {/* If flow is paying grants, show payment amount. If no grants, flow hasn't been spent, and should show incoming flow rate. */}
                    {(flow.subgrants.length > 0
                      ? flow.monthlyOutgoingFlowRate
                      : flow.monthlyIncomingFlowRate
                    ).toString()}
                  </Currency>{" "}
                  /mo
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="flex w-auto flex-col space-y-2">
                {!flow.isTopLevel && (
                  <p className="text-sm">
                    <Currency>{flow.monthlyIncomingFlowRate || 0}</Currency>/month incoming flow.
                  </p>
                )}
                <p className="text-sm">
                  <Currency>{flow.monthlyOutgoingFlowRate || 0}</Currency>/month outgoing flow.
                </p>
                <p className="text-sm">
                  <Currency>{flow.monthlyRewardPoolFlowRate || 0}</Currency>/month goes to curators
                  ({flow.managerRewardPoolFlowRatePercent / 1e4}%)
                </p>
                <Link
                  className="text-sm underline"
                  href={explorerUrl(flow.recipient, base.id, "address")}
                  target="_blank"
                >
                  View on Explorer
                </Link>
              </PopoverContent>
            </Popover>
          </div>
          {!flow.isTopLevel && (
            <>
              <div className="md:text-center">
                <p className="mb-1.5 text-muted-foreground">Community Votes</p>
                <p className="font-medium">{flow.votesCount} </p>
              </div>

              <FlowHeaderUserVotes
                parent={getEthAddress(flow.parentContract)}
                recipientId={flow.id}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
