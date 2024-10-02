import "server-only"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { UserProfile } from "@/components/user-profile/user-profile"
import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { VotingBar } from "./components/voting-bar"
import { VotingInput } from "./components/voting-input"

interface Props {
  params: {
    flowId: string
  }
}

export default async function FlowPage(props: Props) {
  const { flowId } = props.params

  const flow = await getFlowWithGrants(flowId)

  const activeSubgrants = flow.subgrants.filter((grant) => grant.isActive === 1)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={2}>Name</TableHead>
            <TableHead>Builders</TableHead>
            <TableHead className="text-center">Total Earned</TableHead>
            <TableHead className="text-center">Budget</TableHead>
            <TableHead className="text-center">Total Votes</TableHead>
            <TableHead className="text-center">Your Vote</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeSubgrants.map((grant) => (
            <TableRow key={grant.id}>
              <TableCell className="w-[64px] min-w-[64px]">
                <Image
                  src={getIpfsUrl(grant.image)}
                  alt={grant.title}
                  width={64}
                  height={64}
                  className="aspect-square size-12 rounded-md object-cover"
                />
              </TableCell>
              <TableCell>
                <h4 className="mb-1 text-sm md:text-base">
                  <Link
                    href={
                      flow.isTopLevel && grant.isFlow ? `/flow/${grant.id}` : `/grant/${grant.id}`
                    }
                    className="font-medium duration-100 ease-out hover:text-primary"
                    tabIndex={-1}
                  >
                    {grant.title}
                  </Link>
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
              </TableCell>
              <TableCell>
                <div className="flex space-x-0.5">
                  <UserProfile address={getEthAddress(grant.recipient)} key={grant.recipient}>
                    {(profile) => (
                      <Avatar className="size-7 bg-accent text-xs">
                        <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                        <AvatarFallback>{profile.display_name[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </UserProfile>
                </div>
              </TableCell>

              <TableCell className="text-center">
                <Currency>{grant.totalEarned}</Currency>
              </TableCell>

              <TableCell className="text-center">
                <Badge>
                  <Currency>{grant.monthlyFlowRate}</Currency>
                  /mo
                </Badge>
              </TableCell>
              <TableCell className="text-center">{grant.votesCount}</TableCell>

              <TableCell className="w-[100px] max-w-[100px] text-center">
                <VotingInput recipientId={grant.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <VotingBar />
    </>
  )
}
