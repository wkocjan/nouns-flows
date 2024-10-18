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
    <div
      className={cn("relative rounded-lg bg-card p-4 text-card-foreground", {
        shadow: level === 0,
      })}
    >
      <div className="absolute inset-y-4 left-9 -translate-x-px border-l border-border" />
      <div className="relative">
        <UserProfile address={comment.author as `0x${string}`}>
          {(profile) => (
            <div className="inline-flex items-center space-x-2">
              <Avatar className="size-10">
                <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                <AvatarFallback>{profile.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm font-medium">{profile.display_name}</span>
                <p className="text-xs text-muted-foreground">
                  Commented <DateTime date={new Date(comment.createdAt)} relative />
                </p>
              </div>
            </div>
          )}
        </UserProfile>
      </div>
      <div className="mt-2.5 pl-12">
        <div className="text-sm">{comment.content}</div>
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
