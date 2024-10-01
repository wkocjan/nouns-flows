import "server-only"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
} from "@/lib/database/helpers/application"
import { getFlow } from "@/lib/database/queries/flow"
import { Status } from "@/lib/enums"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import { ApplicationChallengeButton } from "./components/ApplicationChallengeButton"
import { ApplicationDispute } from "./components/ApplicationDispute"
import { ApplicationExecuteRequestButton } from "./components/ApplicationExecuteRequestButton"
import { ApplicationExecuteDisputeButton } from "./components/ApplicationExecuteDisputeButton"

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
      where: { flowId, status: Status.RegistrationRequested },
    }),
  ])

  const grantIds = grants.map((grant) => grant.id)

  const disputes = await database.dispute.findMany({
    where: { grantId: { in: grantIds } },
  })

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
          const dispute = disputes.find((dispute) => dispute.grantId === grant.id)

          console.log(dispute)

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
                <h4 className="text-sm font-medium md:text-base">{grant.title}</h4>
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
                    <strong className="font-medium text-green-600">Approved</strong>
                    <span className="text-xs text-muted-foreground">Can be executed</span>
                  </div>
                )}
                {!grant.isDisputed && canBeChallenged(grant) && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex flex-col">
                        <strong className="font-medium">Awaiting</strong>

                        <span className="text-xs text-muted-foreground">
                          Ends{" "}
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

                {dispute && canDisputeBeVotedOn(dispute) && (
                  <div className="flex flex-col">
                    <strong className="font-medium text-yellow-600">Challenged</strong>
                    <span className="text-xs text-muted-foreground">Vote in progress</span>
                  </div>
                )}
                {dispute && canDisputeBeExecuted(dispute) && (
                  <div className="flex flex-col">
                    <strong className="font-medium text-green-600">Ruled</strong>
                    <span className="text-xs text-muted-foreground">Can be executed</span>
                  </div>
                )}
              </TableCell>

              <TableCell className="w-[100px] max-w-[100px]">
                <div className="flex justify-end">
                  {canRequestBeExecuted(grant) && (
                    <ApplicationExecuteRequestButton grant={grant} flow={flow} />
                  )}
                  {canBeChallenged(grant) && (
                    <ApplicationChallengeButton grant={grant} flow={flow} />
                  )}
                  {dispute && canDisputeBeExecuted(dispute) && (
                    <ApplicationExecuteDisputeButton flow={flow} dispute={dispute} />
                  )}
                  {dispute && canDisputeBeVotedOn(dispute) && (
                    <ApplicationDispute grant={grant} flow={flow} />
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
