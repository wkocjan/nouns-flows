"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CommentForm } from "./comment-form"

interface Props {
  commentableId: string
  parentId: string
  level: number
}

export function CommentReply(props: Props) {
  const { commentableId, parentId, level } = props
  const [showReplyForm, setShowReplyForm] = useState(false)

  if (level >= 2) return null

  return (
    <>
      <Button variant="link" size="sm" onClick={() => setShowReplyForm((c) => !c)} className="px-0">
        {showReplyForm ? "Cancel" : "Reply"}
      </Button>
      {showReplyForm && (
        <CommentForm
          commentableId={commentableId}
          parentId={parentId}
          onComment={() => setShowReplyForm(false)}
        />
      )}
    </>
  )
}
