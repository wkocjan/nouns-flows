"use client"

import Noggles from "@/public/noggles.svg"
import { Attachment, ToolInvocation, ToolResultPart } from "ai"
import Image from "next/image"
import { ReactNode } from "react"
import { PreviewAttachment } from "./preview-attachment"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Props {
  role: string
  content: string | ReactNode
  toolInvocations: Array<ToolInvocation> | undefined
  attachments?: Array<Attachment>
}

export const Message = (props: Props) => {
  const { role, content, toolInvocations, attachments } = props

  console.log({ toolInvocations, content })

  return (
    <div
      className="group/message mx-auto w-full max-w-full px-4 animate-in fade-in slide-in-from-bottom-1 md:max-w-3xl"
      data-role={role}
    >
      <div className="flex w-full max-w-full gap-4 group-data-[role=user]/message:ml-auto group-data-[role=user]/message:w-fit md:group-data-[role=user]/message:max-w-xl">
        {role === "assistant" && (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full p-2 ring-1 ring-border md:size-10">
            <Image src={Noggles} alt="Noggles" width={32} height={32} className="h-full w-full" />
          </div>
        )}

        <div className="flex w-full flex-col gap-2 rounded-xl p-3 shadow group-data-[role=assistant]/message:bg-primary/10 group-data-[role=user]/message:bg-card dark:group-data-[role=user]/message:border md:px-5 md:py-3.5">
          {content && (
            <div className="flex flex-col gap-4 whitespace-pre-wrap text-sm leading-6">
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
            const draftId = Number((tool as unknown as ToolResultPart).result)

            if (isNaN(draftId)) return null

            return (
              <Link key={tool.toolCallId} target="_blank" href={`/draft/${draftId}`}>
                <Button size="lg" variant="default" className="w-fit">
                  View your application →
                </Button>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
