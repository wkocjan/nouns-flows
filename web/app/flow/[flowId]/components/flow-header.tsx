import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Markdown } from "@/components/ui/markdown"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import { FlowHeaderUserVotes } from "./flow-header-user-votes"
import { FlowWithGrants } from "./get-flow-with-grants"

interface Props {
  flow: FlowWithGrants
}

export const FlowHeader = (props: Props) => {
  const { flow } = props

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
            <CardTitle className="text-base font-bold md:text-xl">{flow.title}</CardTitle>
            <CardDescription className="text-sm">{flow.tagline}</CardDescription>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" size="sm" className="p-0">
                  Read more
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-screen-sm">
                <DialogHeader>
                  <DialogTitle>{flow.title}</DialogTitle>
                  <DialogDescription>{flow.tagline}</DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4 text-sm text-muted-foreground md:text-base">
                  <Markdown>{flow.description}</Markdown>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-x-4 gap-y-8 text-sm md:w-auto md:shrink-0 md:grid-cols-4">
          <div className="md:text-center">
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
          <div className="md:text-center">
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
          <div className="md:text-center">
            <p className="mb-1.5 text-muted-foreground">Total Votes</p>
            <p className="font-medium">{flow.votesCount} </p>
          </div>

          <FlowHeaderUserVotes parent={getEthAddress(flow.parent)} recipientId={flow.recipientId} />
        </div>
      </CardContent>
    </Card>
  )
}
