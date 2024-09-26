import "server-only"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DateTime } from "@/components/ui/date-time"
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
import { canBeChallenged, canBeExecuted } from "@/lib/database/helpers/application"
import { getFlow } from "@/lib/database/queries/flow"
import { ApplicationStatus } from "@/lib/enums"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import { ApplicationExecuteButton } from "./components/ApplicationExecuteButton"

interface Props {
  params: {
    flowId: string
  }
}

export default async function FlowApplicationsPage(props: Props) {
  const { flowId } = props.params

  const flow = await getFlow(flowId)

  const applications = await database.application.findMany({
    where: { flowId, status: ApplicationStatus.RegistrationRequested },
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2}>Name</TableHead>
          <TableHead>Builders</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-center">Challenge Period End</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) => (
          <TableRow key={application.id}>
            <TableCell className="w-[64px] min-w-[64px]">
              <Image
                src={getIpfsUrl(application.image)}
                alt={application.title}
                width={64}
                height={64}
                className="size-12 rounded-md object-cover"
              />
            </TableCell>
            <TableCell>
              <h4 className="text-sm font-medium md:text-base">{application.title}</h4>
            </TableCell>
            <TableCell>
              <div className="flex space-x-0.5">
                <UserProfile
                  address={getEthAddress(application.recipient)}
                  key={application.recipient}
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

            <TableCell>{application.isFlow ? "Category" : "Grant"}</TableCell>

            <TableCell className="text-center">
              <DateTime date={new Date(application.challengePeriodEndsAt * 1000)} relative />
            </TableCell>

            <TableCell className="w-[100px] max-w-[100px]">
              <div className="flex justify-end">
                {canBeExecuted(application) && (
                  <ApplicationExecuteButton application={application} flow={flow} />
                )}
                {canBeChallenged(application) && <Button variant="outline">Challenge</Button>}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
