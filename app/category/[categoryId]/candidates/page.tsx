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
import { getGrantsForCategory } from "@/lib/data/grants"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import Image from "next/image"
import Link from "next/link"

interface Props {
  params: {
    categoryId: string
  }
}

export default async function CategoryCandidatesPage(props: Props) {
  const { categoryId } = props.params

  const grants = getGrantsForCategory(categoryId)

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
        {grants.map((grant) => (
          <TableRow key={grant.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-4">
                <Image
                  alt={`${grant.title} image`}
                  className="rounded-lg object-cover"
                  height="48"
                  src={grant.imageUrl}
                  width="48"
                />
                <div>
                  <h4 className="mb-1 text-[15px] font-medium">
                    {grant.title}
                  </h4>
                  {grant.isChallenged && (
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
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex space-x-0.5">
                {grant.users.map((user) => (
                  <UserProfile address={user} key={user}>
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
                ))}
              </div>
            </TableCell>

            <TableCell className="text-center">
              {!grant.isChallenged && `Approval in 3 days`}
              {grant.isChallenged && `Voting ends in 2 days`}
            </TableCell>

            <TableCell className="w-[100px] max-w-[100px]">
              <div className="flex justify-end">
                {grant.isChallenged && <Button>Vote</Button>}
                {!grant.isChallenged && (
                  <Button variant="outline">Challenge</Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
