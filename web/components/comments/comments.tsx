import { ScrollArea } from "@/components/ui/scroll-area"
import { SkeletonLoader } from "@/components/ui/skeleton"
import { Suspense } from "react"
import { getComments } from "./comment-actions"
import { CommentForm } from "./comment-form"
import { CommentItem } from "./comment-item"

interface Props {
  commentableId: string
  maxHeight?: number
}

export function Comments({ commentableId, maxHeight }: Props) {
  return (
    <>
      <CommentForm commentableId={commentableId} />
      <Suspense fallback={<SkeletonLoader count={3} height={100} />}>
        <CommentList commentableId={commentableId} maxHeight={maxHeight} />
      </Suspense>
    </>
  )
}

async function CommentList({ commentableId, maxHeight }: Props) {
  const { comments } = await getComments(commentableId)

  if (comments.length === 0) {
    return null
  }

  return (
    <ScrollArea style={{ height: maxHeight }} className="mt-2.5 pr-4" type="hover">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} level={0} />
      ))}
    </ScrollArea>
  )
}
