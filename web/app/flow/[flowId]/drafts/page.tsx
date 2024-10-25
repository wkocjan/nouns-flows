import "server-only"

import { DraftPublishButton } from "@/app/draft/[draftId]/draft-publish-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database"
import { getPinataUrl } from "@/lib/pinata/get-file-url"
import { GrantLogoCell } from "../components/grant-logo-cell"
import { GrantTitleCell } from "../components/grant-title-cell"

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

  const { isTopLevel } = flow

  if (drafts.length === 0) {
    return <EmptyState title="No drafts found" description="Maybe go and create one?" />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2}>Name</TableHead>
          <TableHead>{isTopLevel ? "Proposer" : "Builders"}</TableHead>
          <TableHead className="text-center">Type</TableHead>
          <TableHead className="text-center">Created At</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drafts.map((draft) => (
          <TableRow key={draft.id}>
            <GrantLogoCell image={getPinataUrl(draft.image)} title={draft.title} />
            <GrantTitleCell title={draft.title} href={`/draft/${draft.id}`} />
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
              <p>{draft.isFlow ? "Flow" : "Grant"}</p>
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
