import "server-only"

import { ApplicationExecuteDisputeButton } from "@/app/application/[applicationId]/components/dispute-execute"
import { ApplicationExecuteRequestButton } from "@/app/application/[applicationId]/components/request-execute"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DateTime } from "@/components/ui/date-time"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database"
import {
  canBeChallenged,
  canDisputeBeExecuted,
  canDisputeBeVotedOn,
  canRequestBeExecuted,
  isDisputeResolvedForNoneParty,
  isDisputeWaitingForVoting,
  isRequestRejected,
} from "@/lib/database/helpers/application"
import { getFlow } from "@/lib/database/queries/flow"
import { Status } from "@/lib/enums"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { ApplicationDisputeVoteCta } from "@/app/application/[applicationId]/components/dispute-vote-cta"

interface Props {
  params: {
    flowId: string
  }
}

export default async function FlowApplicationsPage(props: Props) {
  const { flowId } = props.params

  const [flow, grants] = await Promise.all([
    getFlow(flowId),
    database.grant.findMany({
      where: { flowId, status: { in: [Status.RegistrationRequested, Status.Absent] } },
      include: { disputes: true },
    }),
  ])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2}>Name</TableHead>
          <TableHead>Builders</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {grants.map((grant) => {
          const dispute = grant.disputes[0]
          const isDisputeUnresolved = isDisputeResolvedForNoneParty(dispute)
          const isGrantRejected = isRequestRejected(grant, dispute)

          return (
            <TableRow key={grant.id}>
              <TableCell className="w-[64px] min-w-[64px]">
                <Image
                  src={getIpfsUrl(grant.image)}
                  alt={grant.title}
                  width={64}
                  height={64}
                  className="size-12 rounded-md object-cover"
                />
              </TableCell>
              <TableCell>
                <Link
                  href={`/application/${grant.id}`}
                  className="text-sm font-medium duration-100 ease-out hover:text-primary md:text-base"
                  tabIndex={-1}
                >
                  {grant.title}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex space-x-0.5">
                  <UserProfile
                    address={getEthAddress(grant.isFlow ? grant.submitter : grant.recipient)}
                  >
                    {(profile) => (
                      <Avatar className="size-7 bg-accent text-xs">
                        <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                        <AvatarFallback>{profile.display_name[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </UserProfile>
                </div>
              </TableCell>

              <TableCell>{grant.isFlow ? "Category" : "Grant"}</TableCell>

              <TableCell>
                {!grant.isDisputed && canRequestBeExecuted(grant) && (
                  <div className="flex flex-col">
                    <strong className="font-medium text-green-600 dark:text-green-500">
                      Approved
                    </strong>
                    <span className="text-xs text-muted-foreground">Can be executed</span>
                  </div>
                )}

                {!grant.isDisputed && canBeChallenged(grant) && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex flex-col">
                        <strong className="font-medium">Awaiting</strong>

                        <span className="text-xs text-muted-foreground">
                          Approved{" "}
                          <DateTime date={new Date(grant.challengePeriodEndsAt * 1000)} relative />
                        </span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p>
                        During this time, anyone can challenge the application. If no one challenges
                        it by the end, the application is approved.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                )}

                {dispute && (
                  <>
                    {(canDisputeBeVotedOn(dispute) || isDisputeWaitingForVoting(dispute)) && (
                      <div className="flex flex-col">
                        <strong className="font-medium text-yellow-600 dark:text-yellow-500">
                          Challenged
                        </strong>
                        <span className="text-xs text-muted-foreground">
                          {isDisputeWaitingForVoting(dispute)
                            ? "Vote starts soon"
                            : "Vote in progress"}
                        </span>
                      </div>
                    )}
                    {isDisputeUnresolved && (
                      <div className="flex flex-col">
                        <strong className="font-medium text-gray-600 dark:text-gray-400">
                          Unresolved
                        </strong>
                        <span className="text-xs text-muted-foreground">
                          Failed to reach decision.
                        </span>
                      </div>
                    )}
                    {isGrantRejected && (
                      <div className="flex flex-col">
                        <strong className="font-medium text-gray-600 dark:text-gray-400">
                          Not approved
                        </strong>
                        <span className="text-xs text-muted-foreground">
                          Application not approved
                        </span>
                      </div>
                    )}
                    {canDisputeBeExecuted(dispute) && (
                      <div className="flex flex-col">
                        <strong className="font-medium text-green-600 dark:text-green-500">
                          Solved
                        </strong>
                        <span className="text-xs text-muted-foreground">Can be executed</span>
                      </div>
                    )}
                  </>
                )}
              </TableCell>

              <TableCell className="w-[100px] max-w-[100px]">
                <div className="flex justify-end">
                  {canRequestBeExecuted(grant) && (
                    <ApplicationExecuteRequestButton grant={grant} flow={flow} />
                  )}
                  {canBeChallenged(grant) && (
                    <Link href={`/application/${grant.id}`}>
                      <Button>Review</Button>
                    </Link>
                  )}
                  {dispute && canDisputeBeExecuted(dispute) && (
                    <ApplicationExecuteDisputeButton flow={flow} dispute={dispute} />
                  )}
                  {dispute && !canDisputeBeExecuted(dispute) && (
                    <ApplicationDisputeVoteCta dispute={dispute} grant={grant} />
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
