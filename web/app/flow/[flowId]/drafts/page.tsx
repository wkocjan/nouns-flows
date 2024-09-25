import "server-only"

import { DraftPublishButton } from "@/app/draft/[draftId]/draft-publish-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import Link from "next/link"
import { DateTime } from "@/components/ui/date-time"

interface Props {
  params: {
    flowId: string
  }
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function FlowDraftsPage(props: Props) {
  const { flowId } = props.params

  const flow = await database.grant.findFirstOrThrow({
    where: { id: flowId, isFlow: 1, isRemoved: 0 },
  })

  const drafts = await database.draft.findMany({
    where: { flowId, isPrivate: false, isOnchain: false },
    orderBy: { createdAt: "desc" },
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2}>Name</TableHead>
          <TableHead>User(s)</TableHead>
          <TableHead className="text-center">Type</TableHead>
          <TableHead className="text-center">Created At</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drafts.map((draft) => (
          <TableRow key={draft.id}>
            <TableCell className="w-[64px] min-w-[64px]">
              <Image
                src={getPinataUrl(draft.image)}
                alt={draft.title}
                width={64}
                height={64}
                className="size-12 rounded-md object-cover"
              />
            </TableCell>
            <TableCell>
              <Link
                href={`/draft/${draft.id}`}
                className="text-sm font-medium duration-100 ease-out hover:text-primary md:text-base"
                tabIndex={-1}
              >
                {draft.title}
              </Link>
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
              <p>{draft.isFlow ? "Category" : "Grant"}</p>
            </TableCell>

            <TableCell className="text-center">
              <DateTime
                date={draft.createdAt}
                options={{
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }}
              />
            </TableCell>

            <TableCell className="w-[100px] max-w-[100px]">
              <div className="flex justify-end">
                <DraftPublishButton draft={draft} flow={flow} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
