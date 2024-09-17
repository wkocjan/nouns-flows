import { Badge } from "@/components/ui/badge"
import { Card, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import { FlowDescription } from "./flow-description"
import { FlowHeaderUserVotes } from "./flow-header-user-votes"
import { FlowWithGrants } from "./getFlowWithGrants"

interface Props {
  flow: FlowWithGrants
}

export const FlowHeader = (props: Props) => {
  const { flow } = props

  return (
    <Card>
      <CardHeader className="flex flex-col items-start justify-between space-y-4 p-4 md:flex-row md:space-x-4 md:space-y-0 md:p-6">
        <div className="flex flex-col items-start text-center md:flex-row md:space-x-4 md:text-left">
          <Image
            src={getIpfsUrl(flow.image)}
            alt={flow.title}
            className="mb-2 rounded-lg object-cover md:mb-0"
            height="60"
            width="60"
          />
          <FlowDescription
            title={flow.title}
            description={flow.description}
            tagline={flow.tagline}
          />
        </div>
        <div className="grid w-full grid-cols-2 gap-4 text-sm md:w-auto md:shrink-0 md:grid-cols-4">
          <div className="text-center">
            <p className="mb-1.5 text-muted-foreground">Grants</p>
            <div className="space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="success">{flow.subgrants.length}</Badge>
                </TooltipTrigger>
                <TooltipContent>Approved</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="warning">
                    ?{/* {grants.filter((g) => g.isChallenged).length} */}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Challenged</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline">
                    ?{/* {grants.filter((g) => !g.isApproved).length} */}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Awaiting</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="text-center">
            <p className="mb-1.5 text-muted-foreground">Budget</p>
            <Badge>
              {Intl.NumberFormat("en", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(Number(flow.monthlyFlowRate))}
              /mo
            </Badge>
          </div>
          <div className="text-center">
            <p className="mb-1.5 text-muted-foreground">Total Votes</p>
            <p className="font-medium">{flow.votesCount} </p>
          </div>

          {flow.parent && (
            <FlowHeaderUserVotes
              parent={getEthAddress(flow.parent)}
              recipientId={flow.recipientId}
            />
          )}
        </div>
      </CardHeader>
    </Card>
  )
}
