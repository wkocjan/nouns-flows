import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { VotingInput } from "../flow/[flowId]/components/voting-input"

interface Props {
  flows: Array<Grant & { subgrants: Grant[] }>
}

export const FlowsTable = (props: Props) => {
  const { flows } = props

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2}>Name</TableHead>
          <TableHead className="text-center">Flows</TableHead>
          <TableHead className="text-center">Paid out</TableHead>
          <TableHead className="text-center">Budget</TableHead>
          <TableHead className="text-center">Total Votes</TableHead>
          <TableHead className="text-center">Your Vote</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flows.map((flow) => (
          <TableRow key={flow.title}>
            <TableCell className="min-w-[64px] md:w-[92px]">
              <Image
                src={getIpfsUrl(flow.image)}
                alt={flow.title}
                width={64}
                height={64}
                className="aspect-square size-12 rounded-md object-cover md:size-16"
              />
            </TableCell>
            <TableCell>
              <Link
                href={`/flow/${flow.id}`}
                className="font-medium duration-100 ease-out hover:text-primary md:text-lg"
                tabIndex={-1}
              >
                {flow.title}
              </Link>
              <p className="text-xs tracking-tight text-muted-foreground max-sm:hidden md:text-sm">
                {flow.tagline}
              </p>
            </TableCell>
            <TableCell className="space-x-1 text-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="success">{flow.subgrants.filter((g) => g.isActive).length}</Badge>
                </TooltipTrigger>
                <TooltipContent>Approved</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="warning">
                    {flow.subgrants.filter((g) => g.isDisputed && !g.isActive).length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Challenged</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline">
                    {
                      flow.subgrants.filter((g) => !g.isActive && !g.isDisputed && !g.isResolved)
                        .length
                    }
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Awaiting</TooltipContent>
              </Tooltip>
            </TableCell>
            <TableCell className="text-center">
              <Currency>{flow.totalEarned}</Currency>
            </TableCell>
            <TableCell className="text-center">
              <Badge>
                <Currency>
                  {/* If flow is paying grants, show payment amount. If no grants, flow hasn't been spent, and should show incoming flow rate. */}
                  {flow.subgrants.length > 0
                    ? flow.monthlyOutgoingFlowRate
                    : flow.monthlyIncomingFlowRate}
                </Currency>
                /mo
              </Badge>
            </TableCell>
            <TableCell className="text-center">{flow.votesCount}</TableCell>
            <TableCell className="w-[100px] max-w-[100px] text-center">
              <VotingInput recipientId={flow.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
