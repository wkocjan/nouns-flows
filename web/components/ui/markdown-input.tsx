"use client"

import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { CSSProperties, useState } from "react"

interface Props {
  name: string
  initialContent?: string
  minHeight?: CSSProperties["minHeight"]
  editable?: boolean
  className?: string
}

const MarkdownEditor = dynamic(
  () => import("@/components/global/markdown-editor/markdown-editor"),
  {
    ssr: false,
  },
)

export const MarkdownInput = (props: Props) => {
  const { name, initialContent, editable = true, minHeight = 320, className = "" } = props
  const [markdown, setMarkdown] = useState(initialContent)

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-transparent px-3 py-5 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
      style={{ minHeight }}
    >
      <MarkdownEditor initialContent={initialContent} onUpdate={setMarkdown} editable={editable} />
      <input type="hidden" name={name} value={markdown} />
    </div>
  )
}
