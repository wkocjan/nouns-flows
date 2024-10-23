import { AnimatedSalary } from "@/components/global/animated-salary"
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
import { Status } from "@/lib/enums"
import { getIpfsUrl, isGrantApproved } from "@/lib/utils"
import { Grant } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { VotingInput } from "../flow/[flowId]/components/voting-input"
import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import pluralize from "pluralize"
import { MonthlyBudget } from "./monthly-budget"

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
          <TableHead className="text-center">Grants</TableHead>
          <TableHead className="text-center">Paid out</TableHead>
          <TableHead className="text-center">Monthly support</TableHead>
          <TableHead className="text-center">Community Votes</TableHead>
          <TableHead className="text-center">Your Vote</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flows.sort(sortGrants).map((flow) => {
          const isGoingNegative =
            flow.isFlow == 1 &&
            Number(flow.monthlyOutgoingFlowRate) > Number(flow.monthlyIncomingFlowRate)

          const approvedGrants = flow.subgrants.filter((g) => isGrantApproved(g)).length

          return (
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

                {flow.status === Status.ClearingRequested && (
                  <Link tabIndex={-1} href={`/item/${flow.id}`}>
                    <Badge variant="destructive">Removal Requested</Badge>
                  </Link>
                )}
              </TableCell>
              <TableCell>
                <GrantStatusCountBadges id={flow.id} subgrants={flow.subgrants} alwaysShowAll />
              </TableCell>
              <TableCell className="text-center">
                <AnimatedSalary
                  value={flow.totalEarned}
                  monthlyRate={
                    flow.isFlow ? flow.monthlyOutgoingFlowRate : flow.monthlyIncomingFlowRate
                  }
                />
              </TableCell>
              <TableCell className="text-center">
                <MonthlyBudget
                  display={
                    flow.isFlow ? flow.monthlyOutgoingFlowRate : flow.monthlyIncomingFlowRate
                  }
                  isGoingNegative={isGoingNegative}
                  flow={flow}
                  approvedGrants={approvedGrants}
                />
              </TableCell>
              <TableCell className="text-center">{flow.votesCount}</TableCell>
              <TableCell className="w-[100px] max-w-[100px] text-center">
                <VotingInput recipientId={flow.id} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

function sortGrants(a: Grant & { subgrants: Grant[] }, b: Grant & { subgrants: Grant[] }) {
  const aIsClearingRequested = a.status === Status.ClearingRequested
  const bIsClearingRequested = b.status === Status.ClearingRequested
  if (aIsClearingRequested && !bIsClearingRequested) {
    return -1
  } else if (!aIsClearingRequested && bIsClearingRequested) {
    return 1
  } else {
    const aApprovedCount = a.subgrants.filter(isGrantApproved).length
    const bApprovedCount = b.subgrants.filter(isGrantApproved).length
    return bApprovedCount - aApprovedCount
  }
}
