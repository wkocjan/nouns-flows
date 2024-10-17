import "server-only"

import { DisputeExecuteButton } from "@/app/components/dispute/dispute-execute"
import { DisputeVoteCta } from "@/app/components/dispute/dispute-vote-cta"
import {
  canBeChallenged,
  canDisputeBeExecuted,
  canDisputeBeVotedOn,
  canRequestBeExecuted,
  isDisputeResolvedForNoneParty,
  isDisputeRevealingVotes,
  isDisputeWaitingForVoting,
  isRequestRejected,
} from "@/app/components/dispute/helpers"
import { RequestExecuteButton } from "@/app/components/dispute/request-execute"
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
import { getFlow } from "@/lib/database/queries/flow"
import { Status } from "@/lib/enums"
import { getPinataUrl } from "@/lib/pinata/get-file-url"
import { getEthAddress } from "@/lib/utils"
import Link from "next/link"
import { GrantLogoCell } from "../components/grant-logo-cell"
import { GrantTitleCell } from "../components/grant-title-cell"

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
      where: { flowId, status: { in: [Status.RegistrationRequested] } },
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
              <GrantLogoCell image={getPinataUrl(grant.image)} title={grant.title} />
              <GrantTitleCell title={grant.title} href={`/application/${grant.id}`} />
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

              <TableCell>{grant.isFlow ? "Flow" : "Grant"}</TableCell>

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
                    {isDisputeRevealingVotes(dispute) && (
                      <div className="flex flex-col">
                        <strong className="font-medium text-gray-600 dark:text-gray-400">
                          Revealing
                        </strong>
                        <span className="text-xs text-muted-foreground">
                          Votes are being revealed.
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
                    <RequestExecuteButton grant={grant} flow={flow} />
                  )}
                  {canBeChallenged(grant) && (
                    <Link href={`/application/${grant.id}`}>
                      <Button>Review</Button>
                    </Link>
                  )}
                  {dispute && canDisputeBeExecuted(dispute) && (
                    <DisputeExecuteButton flow={flow} dispute={dispute} />
                  )}
                  {dispute && !canDisputeBeExecuted(dispute) && (
                    <DisputeVoteCta dispute={dispute} grant={grant} />
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
