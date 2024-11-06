"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useLogin } from "@/lib/auth/use-login"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useAccount } from "wagmi"
import { addComment } from "./comment-actions"

interface Props {
  commentableId: string
  parentId?: string
  onComment?: () => void
  level?: number
}

export function CommentForm(props: Props) {
  const { commentableId, parentId, onComment, level = 1 } = props
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { address } = useAccount()
  const { login } = useLogin()
  const router = useRouter()

  return (
    <form
      action={async () => {
        if (!address) {
          login()
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
        rows={1}
        className="min-h-[1em]"
      />
      <Button
        type="submit"
        size="sm"
        disabled={!content.trim() || isSubmitting}
        loading={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : `Add ${level === 1 ? "comment" : "reply"}`}
      </Button>
    </form>
  )
}
