import "server-only"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import { getPinataUrl } from "@/lib/pinata/get-file-url"
import Image from "next/image"

interface Props {
  params: {
    flowId: string
  }
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function FlowDraftsPage(props: Props) {
  const { flowId } = props.params

  const drafts = await database.draft.findMany({
    where: { flowId, isPrivate: false, isOnchain: false },
    orderBy: { createdAt: "desc" },
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="lg:w-[350px]">Name</TableHead>
          <TableHead>User(s)</TableHead>
          <TableHead className="text-center">Submitted</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drafts.map((draft) => (
          <TableRow key={draft.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-4">
                <Image
                  alt={`${draft.title}`}
                  className="aspect-square size-12 rounded-lg object-cover"
                  height="48"
                  src={getPinataUrl(draft.image)}
                  width="48"
                />
                <div>
                  <h4 className="mb-1 text-[15px] font-medium">{draft.title}</h4>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex space-x-0.5">
                {draft.users.map((user) => (
                  <UserProfile address={user as `0x${string}`} key={user}>
                    {(profile) => (
                      <Avatar className="size-7 bg-accent text-xs">
                        <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                        <AvatarFallback>{profile.display_name[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </UserProfile>
                ))}
              </div>
            </TableCell>

            <TableCell className="text-center">
              {draft.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </TableCell>

            <TableCell className="w-[100px] max-w-[100px]">
              <div className="flex justify-end">
                <Button variant="outline">Sponsor</Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
