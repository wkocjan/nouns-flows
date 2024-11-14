"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import useWindowSize from "@/lib/hooks/use-window-size"
import { useFileUploads } from "@/lib/pinata/use-file-uploads"
import { getIpfsUrl } from "@/lib/utils"
import { ArrowUp, Paperclip, StopCircle } from "lucide-react"
import React, { ChangeEvent, useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import { useAgentChat } from "./agent-chat"
import { PreviewAttachment } from "./preview-attachment"

const maxFileSize = 15 * 1024 * 1024 // 10MB

export function MultimodalInput() {
  const { input, setInput, isLoading, stop, attachments, setAttachments, handleSubmit, user } =
    useAgentChat()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { width } = useWindowSize()

  useEffect(() => {
    if (textareaRef.current) adjustHeight()
  }, [])

  const disabled = !user

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`
    }
  }

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value)
    adjustHeight()
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadQueue, uploadFiles } = useFileUploads()

  const submitForm = useCallback(() => {
    if (!input.trim()) return

    handleSubmit(undefined, { experimental_attachments: attachments })

    setAttachments([])

    if (width && width > 768) {
      textareaRef.current?.focus()
    }
  }, [attachments, handleSubmit, setAttachments, width, input])

  return (
    <form
      className="mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:max-w-3xl md:pb-6"
      onSubmit={handleSubmit}
    >
      <div className="relative flex w-full flex-col gap-4">
        <input
          type="file"
          disabled={disabled}
          className="pointer-events-none fixed -left-4 -top-4 size-0.5 opacity-0"
          ref={fileInputRef}
          multiple
          onChange={async (event: ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(event.target.files || [])
            for (const file of files) {
              if (file.size > maxFileSize) {
                toast.error(`Max file size is ${maxFileSize / 1024 / 1024}MB`, { duration: 3000 })
                return
              }
            }

            const uploadedAttachments = await uploadFiles(Array.from(event.target.files || []))

            setAttachments((c) => [
              ...c,
              ...uploadedAttachments.map((a) => ({ ...a, url: getIpfsUrl(a.url, "pinata") })),
            ])
          }}
          tabIndex={-1}
          accept="image/*"
        />

        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div className="flex space-x-2.5 overflow-x-auto">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}

            {uploadQueue.map((filename) => (
              <PreviewAttachment
                key={filename}
                attachment={{ url: "", name: filename, contentType: "" }}
                isUploading={true}
              />
            ))}
          </div>
        )}

        <Textarea
          ref={textareaRef}
          placeholder="Send a message..."
          value={input}
          disabled={disabled}
          onChange={handleInput}
          className="max-h-48 min-h-6 resize-none overflow-hidden rounded-xl border-none bg-card p-4 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-secondary"
          rows={3}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()

              if (isLoading) {
                toast.error("Please wait for the model to finish its response!")
              } else if (!input.trim()) {
                return
              } else {
                submitForm()
              }
            }
          }}
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <Button
            className="h-fit rounded-full p-1.5"
            onClick={(event) => {
              event.preventDefault()
              fileInputRef.current?.click()
            }}
            variant="outline"
            disabled={isLoading || disabled}
            type="button"
          >
            <Paperclip size={14} />
          </Button>

          {isLoading ? (
            <Button
              className="h-fit rounded-full p-1.5"
              type="button"
              disabled={disabled}
              onClick={(event) => {
                event.preventDefault()
                stop()
              }}
            >
              <StopCircle size={14} />
            </Button>
          ) : (
            <Button
              className="h-fit rounded-full p-1.5"
              onClick={(event) => {
                event.preventDefault()
                submitForm()
              }}
              disabled={!input.trim() || uploadQueue.length > 0 || disabled}
              type="submit"
            >
              <ArrowUp size={14} />
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
