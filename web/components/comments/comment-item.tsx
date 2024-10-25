import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DateTime } from "@/components/ui/date-time"
import { UserProfile } from "@/components/user-profile/user-profile"
import { cn } from "@/lib/utils"
import { Comment } from "@prisma/client"
import { CommentReply } from "./comment-reply"

interface Props {
  comment: Comment & { replies?: Comment[] }
  level: number
}

export function CommentItem(props: Props) {
  const { comment, level } = props

  return (
    <div className={cn("relative py-3", { "group border-b": level === 0 })}>
      <div className="absolute inset-y-4 left-[14px] border-l transition-colors group-hover:border-l-foreground/40" />
      <div className="relative flex items-center justify-between space-x-2">
        <UserProfile address={comment.author as `0x${string}`}>
          {(profile) => (
            <div className="inline-flex items-center space-x-2">
              <Avatar className="size-7">
                <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                <AvatarFallback>{profile.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">{profile.display_name}</span>
            </div>
          )}
        </UserProfile>
        <p className="text-xs text-muted-foreground">
          <DateTime date={new Date(comment.createdAt)} relative short />
        </p>
      </div>
      <div className="mt-1.5 pl-9 pr-px">
        <div className="mb-1.5 text-sm">{comment.content}</div>
        <CommentReply commentableId={comment.commentableId} parentId={comment.id} level={level} />
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 mt-2.5 space-y-4 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
