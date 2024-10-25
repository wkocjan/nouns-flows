"use client"

import { uploadFile } from "@/lib/pinata/upload-file"
import { getIpfsUrl } from "@/lib/utils"
import { isVideoFile } from "@/lib/video/is-video-file"
import { uploadVideo } from "@/lib/video/upload-video"
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"
import { useCreateBlockNote } from "@blocknote/react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BlockVideoPlayer } from "./block-video-player"
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

  const editor = useCreateBlockNote({
    schema: BlockNoteSchema.create({
      blockSpecs: {
        ...defaultBlockSpecs,
        audio: undefined as any,
        file: undefined as any,
        video: BlockVideoPlayer,
      },
    }),
    defaultStyles: false,
    uploadFile: async (file) => {
      const isVideo = isVideoFile(file)
      const maxFileSizeMB = isVideo ? 100 : 20

      if (file.size > maxFileSizeMB * 1024 * 1024) {
        toast.error(`Max file size is ${maxFileSizeMB}MB`)
        throw new Error("File too large")
      }

      const ipfsUrl = getIpfsUrl(await uploadFile(file), "pinata")
      return isVideoFile(file) ? await uploadVideo(ipfsUrl) : ipfsUrl
    },
  })

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
      sideMenu={false}
    />
  )
}
