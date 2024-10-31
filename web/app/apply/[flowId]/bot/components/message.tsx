"use client"

import Flo from "@/public/flo.png"
import { Attachment, ToolInvocation } from "ai"
import Image from "next/image"
import { ReactNode } from "react"
import { PreviewAttachment } from "./preview-attachment"
import { SubmitApplicationResult } from "./tools/submit-application"

interface Props {
  role: string
  content: string | ReactNode
  toolInvocations: Array<ToolInvocation> | undefined
  attachments?: Array<Attachment>
}

export const Message = (props: Props) => {
  const { role, content, toolInvocations, attachments } = props

  return (
    <div
      className="group/message mx-auto w-full max-w-full px-4 animate-in fade-in slide-in-from-bottom-1 md:max-w-3xl"
      data-role={role}
    >
      <div className="flex w-full max-w-full gap-4 group-data-[role=user]/message:ml-auto group-data-[role=user]/message:w-fit md:group-data-[role=user]/message:max-w-xl">
        {role === "assistant" && (
          <div className="flex size-[40px] shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-border md:size-10">
            <Image
              src={Flo}
              alt="Noggles"
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex w-full flex-col gap-2 rounded-xl p-3 shadow group-data-[role=assistant]/message:bg-primary/10 group-data-[role=user]/message:bg-card dark:group-data-[role=user]/message:border md:px-5 md:py-3.5">
          {content && (
            <div className="flex flex-col gap-4 whitespace-pre-wrap break-words text-sm leading-6">
              {(content as string).replace(/^(\n\n)+/, "")}
            </div>
          )}

          {attachments && (
            <div className="flex gap-2.5 overflow-x-auto">
              {attachments.map((attachment) => (
                <PreviewAttachment key={attachment.url} attachment={attachment} />
              ))}
            </div>
          )}
        </div>
      </div>
      {toolInvocations && (
        <div className="mt-4 flex flex-col items-center gap-2 py-3">
          {toolInvocations.map((tool) => {
            const { toolName, toolCallId, state } = tool

            if (state === "result") {
              switch (toolName) {
                case "submitApplication":
                  return <SubmitApplicationResult key={toolCallId} draftId={Number(tool.result)} />
                default:
                  return null
              }
            } else {
              return (
                <div key={toolCallId} className="animate-pulse text-xs text-muted-foreground">
                  Please wait...
                </div>
              )
            }
          })}
        </div>
      )}
    </div>
  )
}
