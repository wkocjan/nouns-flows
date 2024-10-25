import "server-only"

import { MonthlyBudget } from "@/app/components/monthly-budget"
import { AnimatedSalary } from "@/components/global/animated-salary"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DateTime } from "@/components/ui/date-time"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database"
import { Status } from "@/lib/enums"
import { cn, getEthAddress, getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/client"
import Link from "next/link"
import { GrantLogoCell } from "./components/grant-logo-cell"
import { VotingBar } from "./components/voting-bar"
import { VotingInput } from "./components/voting-input"

interface Props {
  params: {
    flowId: string
  }
}

export default async function FlowPage(props: Props) {
  const { flowId } = props.params

  const flow = await database.grant.findFirstOrThrow({
    where: { id: flowId, isActive: 1 },
    include: {
      subgrants: {
        where: { isActive: 1 },
        include: {
          updates: {
            select: { createdAt: true, fid: true },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  })

  if (flow.subgrants.length === 0) {
    return <EmptyState title="No grants found" description="There are no approved grants yet" />
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={2}>Name</TableHead>
            {!flow.isTopLevel && <TableHead>Builders</TableHead>}
            <TableHead className="text-center">Total earned</TableHead>
            <TableHead className="text-center">Monthly support</TableHead>
            <TableHead className="text-center">Community Votes</TableHead>
            <TableHead className="text-center">Your Vote</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flow.subgrants.sort(sortGrants).map((grant) => {
            const isRemovalRequested = grant.status === Status.ClearingRequested
            const hasUpdate = grant.updates.length > 0
            const lastUpdateTime = hasUpdate ? grant.updates[0]?.createdAt.getTime() / 1000 : 0
            const hasRecentUpdate =
              hasUpdate && new Date().getTime() / 1000 - lastUpdateTime < 14 * 24 * 60 * 60

            return (
              <TableRow key={grant.id}>
                <GrantLogoCell image={getIpfsUrl(grant.image)} title={grant.title} />

                <TableCell className="space-y-1">
                  <div className="max-w-[250px] overflow-hidden truncate text-ellipsis">
                    <Link
                      href={
                        flow.isTopLevel && grant.isFlow && !isRemovalRequested
                          ? `/flow/${grant.id}`
                          : `/item/${grant.id}`
                      }
                      className="text-sm font-medium duration-100 ease-out hover:text-primary md:text-lg"
                      tabIndex={-1}
                    >
                      {grant.title}
                    </Link>
                  </div>

                  {isRemovalRequested && <Badge variant="destructive">Removal Requested</Badge>}
                </TableCell>
                {!flow.isTopLevel && (
                  <TableCell>
                    <div className="relative inline-flex">
                      <UserProfile address={getEthAddress(grant.recipient)} key={grant.recipient}>
                        {(profile) => (
                          <div className="flex items-center space-x-1.5">
                            <Avatar className="size-7 bg-accent text-xs">
                              <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                              <AvatarFallback>
                                {profile.display_name[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="tracking-tight max-sm:hidden">
                              {profile.display_name}
                            </span>
                          </div>
                        )}
                      </UserProfile>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              "absolute right-0 top-0 mx-2 inline-block size-2.5 translate-x-full cursor-help rounded-full",
                              {
                                "bg-red-500": !hasRecentUpdate,
                                "bg-green-500": hasRecentUpdate,
                              },
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          {hasUpdate && (
                            <p>
                              Posted update <DateTime date={grant.updates[0]?.createdAt} relative />
                            </p>
                          )}
                          {!hasUpdate && <p>Builder hasn&apos;t posted any updates yet</p>}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                )}

                <TableCell className="text-center">
                  <AnimatedSalary
                    value={grant.totalEarned}
                    monthlyRate={grant.monthlyIncomingFlowRate}
                  />
                </TableCell>

                <TableCell className="text-center">
                  <MonthlyBudget
                    multiplyBy={10}
                    display={grant.monthlyIncomingFlowRate}
                    flow={grant}
                  />
                </TableCell>
                <TableCell className="text-center">{grant.votesCount}</TableCell>

                <TableCell className="w-[100px] max-w-[100px] text-center">
                  <VotingInput recipientId={grant.id} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <VotingBar />
    </>
  )
}

function sortGrants(a: Grant, b: Grant) {
  const aIsClearingRequested = a.status === Status.ClearingRequested
  const bIsClearingRequested = b.status === Status.ClearingRequested
  if (aIsClearingRequested && !bIsClearingRequested) {
    return -1
  } else if (!aIsClearingRequested && bIsClearingRequested) {
    return 1
  } else {
    return Number(b.monthlyIncomingFlowRate) - Number(a.monthlyIncomingFlowRate)
  }
}
