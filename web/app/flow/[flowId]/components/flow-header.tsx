import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/client"
import Image from "next/image"

interface Props {
  flow: Grant
}

export const FlowHeader = (props: Props) => {
  const { flow } = props

  return (
    <Card>
      <CardHeader className="flex flex-col items-center justify-between space-y-4 p-4 md:flex-row md:space-y-0 md:p-6">
        <div className="flex flex-col items-center text-center md:flex-row md:space-x-4 md:text-left">
          <Image
            src={getIpfsUrl(flow.image)}
            alt={flow.title}
            className="mb-2 rounded-lg object-cover md:mb-0"
            height="60"
            width="60"
          />
          <div>
            <CardTitle className="text-xl font-bold">{flow.title}</CardTitle>
            <CardDescription className="text-sm">
              {flow.tagline}
            </CardDescription>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-4 text-sm md:w-auto md:grid-cols-4">
          <div className="text-center">
            <p className="mb-1.5 text-muted-foreground">Grants</p>
            <div className="space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="success">
                    10
                    {/* {grants.filter((g) => g.isApproved).length} */}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Approved</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="warning">
                    20
                    {/* {grants.filter((g) => g.isChallenged).length} */}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Challenged</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline">
                    5{/* {grants.filter((g) => !g.isApproved).length} */}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Awaiting</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="text-center">
            <p className="mb-1.5 text-muted-foreground">Budget</p>
            <Badge>
              $123
              {/* {grants
                .reduce((sum, grant) => sum + grant.budget, 0)
                .toLocaleString("en-US")} */}
              /mo
            </Badge>
          </div>
          <div className="text-center">
            <p className="mb-1.5 text-muted-foreground">Total Votes</p>
            <p className="font-medium">
              123
              {/* {grants
                .reduce((sum, grant) => sum + grant.votes, 0)
                .toLocaleString("en-US")} */}
            </p>
          </div>
          <div className="text-center">
            <p className="mb-1.5 text-muted-foreground">Your Vote</p>
            <p className="font-medium">0%</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
