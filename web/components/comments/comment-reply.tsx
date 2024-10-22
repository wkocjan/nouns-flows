"use client"

import { ChatBubbleIcon, Cross2Icon } from "@radix-ui/react-icons"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
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
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="transition-colors hover:text-primary"
            onClick={() => setShowReplyForm((c) => !c)}
          >
            {showReplyForm ? (
              <Cross2Icon className="size-3.5" />
            ) : (
              <ChatBubbleIcon className="size-3.5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>{showReplyForm ? "Cancel" : "Reply"}</TooltipContent>
      </Tooltip>
      {showReplyForm && (
        <CommentForm
          commentableId={commentableId}
          parentId={parentId}
          onComment={() => setShowReplyForm(false)}
          level={level + 1}
        />
      )}
    </>
  )
}
