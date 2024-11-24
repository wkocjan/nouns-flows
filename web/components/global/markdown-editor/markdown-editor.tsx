"use client"

import { uploadFile } from "@/lib/pinata/upload-file"
import { getIpfsUrl } from "@/lib/utils"
import { isVideoFile } from "@/lib/video/is-video-file"
import { Block, BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"
import { useCreateBlockNote } from "@blocknote/react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import "./markdown-editor.css"

type Props = {
  initialMarkdown?: string
  initialBlocks?: Block[]
  onUpdate?: (blocks: Block[], markdown: string) => void
  editable?: boolean
}

export default function MarkdownEditor(props: Props) {
  const { onUpdate, editable, initialBlocks, initialMarkdown } = props
  const { resolvedTheme } = useTheme()
  const [isInitialized, setIsInitialized] = useState(initialBlocks || !initialMarkdown)

  const editor = useCreateBlockNote({
    schema: BlockNoteSchema.create({
      blockSpecs: {
        ...defaultBlockSpecs,
        audio: undefined as any,
        file: undefined as any,
      },
    }),
    initialContent: initialBlocks,
    defaultStyles: false,
    uploadFile: async (file) => {
      const isVideo = isVideoFile(file)
      const maxFileSizeMB = isVideo ? 100 : 20

      if (file.size > maxFileSizeMB * 1024 * 1024) {
        toast.error(`Max file size is ${maxFileSizeMB}MB`)
        throw new Error("File too large")
      }

      const ipfsUrl = getIpfsUrl(await uploadFile(file), "pinata")
      return ipfsUrl
    },
  })

  useEffect(() => {
    if (!editor || !initialMarkdown || initialBlocks) return
    editor.tryParseMarkdownToBlocks(initialMarkdown).then((blocks) => {
      editor.replaceBlocks(editor.document, blocks)
      onUpdate?.(editor.document, initialMarkdown)
      setIsInitialized(true)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, initialMarkdown, initialBlocks])

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onChange={async () => {
        if (!isInitialized) return
        onUpdate?.(editor.document, await editor.blocksToMarkdownLossy(editor.document))
      }}
      data-markdown-editor
      sideMenu={false}
    />
  )
}
