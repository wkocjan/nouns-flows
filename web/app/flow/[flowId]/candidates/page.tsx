import "server-only"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserProfile } from "@/components/user-profile/user-profile"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import Image from "next/image"
import { getFlowWithGrants } from "../components/getFlowWithGrants"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"

interface Props {
  params: {
    flowId: string
  }
}

export default async function FlowCandidatesPage(props: Props) {
  const { flowId } = props.params

  const flow = await getFlowWithGrants(flowId)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[350px]">Name</TableHead>
          <TableHead>Builders</TableHead>
          <TableHead className="text-center">Remaining time</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flow.subgrants.map((grant) => (
          <TableRow key={grant.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-4">
                <Image
                  alt={`${grant.title} image`}
                  className="rounded-lg object-cover"
                  height="48"
                  src={getIpfsUrl(grant.image)}
                  width="48"
                />
                <div>
                  <h4 className="mb-1 text-[15px] font-medium">
                    {grant.title}
                  </h4>
                  {/* {grant.isChallenged && (
                    <HoverCard openDelay={250}>
                      <HoverCardTrigger>
                        <Badge variant="warning">
                          <ExclamationTriangleIcon className="mr-1" />
                          Challenged
                        </Badge>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex space-x-1 whitespace-normal">
                          Remaining days + your vote + button
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  )} */}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex space-x-0.5">
                <UserProfile
                  address={getEthAddress(grant.recipient)}
                  key={grant.recipient}
                >
                  {(profile) => (
                    <Avatar className="size-7 bg-accent text-xs">
                      <AvatarImage
                        src={profile.pfp_url}
                        alt={profile.display_name}
                      />
                      <AvatarFallback>
                        {profile.display_name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </UserProfile>
              </div>
            </TableCell>

            <TableCell className="text-center">
              Approval in 3 days
              {/* {!grant.isChallenged && `Approval in 3 days`} */}
              {/* {grant.isChallenged && `Voting ends in 2 days`} */}
            </TableCell>

            <TableCell className="w-[100px] max-w-[100px]">
              <div className="flex justify-end">
                <Button variant="outline">Challenge</Button>
                {/* {grant.isChallenged && <Button>Vote</Button>}
                {!grant.isChallenged && (
                  <Button variant="outline">Challenge</Button>
                )} */}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
