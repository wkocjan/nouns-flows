"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useModal } from "connectkit"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useAccount } from "wagmi"
import { addComment } from "./comment-actions"

interface Props {
  commentableId: string
  parentId?: string
  onComment?: () => void
}

export function CommentForm(props: Props) {
  const { commentableId, parentId, onComment } = props
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { address } = useAccount()
  const { setOpen } = useModal()
  const router = useRouter()

  return (
    <form
      action={async () => {
        if (!address) {
          setOpen(true)
          return
        }

        setIsSubmitting(true)
        const { error } = await addComment(commentableId, content, address, parentId)
        setIsSubmitting(false)

        if (error) {
          toast.error(error)
        } else {
          setContent("")
          onComment?.()
          toast.success("Comment added!")
          router.refresh()
        }
      }}
      className="flex flex-col items-end space-y-1.5"
    >
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        // @ts-ignore
        style={{ fieldSizing: "content" }}
        autoFocus={!!parentId}
      />
      <Button type="submit" disabled={!content.trim() || isSubmitting} loading={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Add comment"}
      </Button>
    </form>
  )
}
