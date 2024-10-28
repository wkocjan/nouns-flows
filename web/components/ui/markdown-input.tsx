"use client"

import { cn } from "@/lib/utils"
import { Block } from "@blocknote/core"
import dynamic from "next/dynamic"
import { CSSProperties, useState } from "react"

interface Props {
  name: string
  initialBlocks?: Block[]
  initialMarkdown?: string
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
  const {
    name,
    initialBlocks,
    initialMarkdown,
    editable = true,
    minHeight = 320,
    className = "",
  } = props
  const [blocks, setBlocks] = useState(initialBlocks)
  const [markdown, setMarkdown] = useState(initialMarkdown)

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-transparent px-3 py-5 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
      style={{ minHeight }}
    >
      <MarkdownEditor
        initialBlocks={initialBlocks}
        initialMarkdown={initialMarkdown}
        onUpdate={(blocks, markdown) => {
          setBlocks(blocks)
          setMarkdown(markdown)
        }}
        editable={editable}
      />
      <input type="hidden" name={`${name}Blocks`} value={JSON.stringify(blocks)} />
      <input type="hidden" name={`${name}Markdown`} value={markdown} />
    </div>
  )
}
