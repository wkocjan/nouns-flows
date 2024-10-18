import { SkeletonLoader } from "@/components/ui/skeleton"
import { Suspense } from "react"
import { getComments } from "./comment-actions"
import { CommentForm } from "./comment-form"
import { CommentItem } from "./comment-item"

interface Props {
  commentableId: string
}

export function Comments({ commentableId }: Props) {
  return (
    <div className="space-y-4">
      <CommentForm commentableId={commentableId} />
      <Suspense fallback={<SkeletonLoader count={3} height={100} />}>
        <CommentList commentableId={commentableId} />
      </Suspense>
    </div>
  )
}

async function CommentList({ commentableId }: Props) {
  const { comments } = await getComments(commentableId)

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} level={0} />
      ))}
    </div>
  )
}
