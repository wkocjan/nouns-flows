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
        {flows
          .sort((a, b) => {
            const aApprovedCount = a.subgrants.filter(isGrantApproved).length
            const bApprovedCount = b.subgrants.filter(isGrantApproved).length
            return bApprovedCount - aApprovedCount
          })
          .map((flow) => (
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
                  <Badge variant="destructive">Removal Requested</Badge>
                )}
              </TableCell>
              <TableCell>
                <GrantStatusCountBadges subgrants={flow.subgrants} alwaysShowAll />
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
                <Badge>
                  <Currency>
                    {flow.isFlow ? flow.monthlyOutgoingFlowRate : flow.monthlyIncomingFlowRate}
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
