"use client"

import { BlockNoteView } from "@blocknote/mantine"
import { useCreateBlockNote } from "@blocknote/react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import "@blocknote/mantine/style.css"
import "./markdown-editor.css"

type Props = {
  initialContent?: string
  onUpdate?: (markdown: string) => void
  editable?: boolean
}

export default function MarkdownEditor(props: Props) {
  const { onUpdate, editable, initialContent } = props
  const [isInitialized, setIsInitialized] = useState(!initialContent)
  const { resolvedTheme } = useTheme()

  const editor = useCreateBlockNote({ defaultStyles: false })

  useEffect(() => {
    if (!editor || !initialContent) return
    editor.tryParseMarkdownToBlocks(initialContent).then((blocks) => {
      editor.replaceBlocks(editor.document, blocks)
      setIsInitialized(true)
    })
  }, [editor, initialContent])

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onChange={() => {
        if (!isInitialized) return
        onUpdate && editor.blocksToMarkdownLossy(editor.document).then(onUpdate)
      }}
      data-markdown-editor
    />
  )
}
