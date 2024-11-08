"use client"

import { Chat } from "@/app/chat/components/chat"
import { Button } from "@/components/ui/button"
import { User } from "@/lib/auth/user"
import { Grant } from "@prisma/flows"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import StartImage from "./start.svg"
import { useRecipientExists } from "./useRecipientExists"

interface Props {
  flow: Grant
  user?: User
}

export function ApplicationChat(props: Props) {
  const { flow, user } = props

  const chatId = `chat-${flow.id}-${user?.address}`

  const recipientExists = useRecipientExists(flow.recipient, user?.address)

  return (
    <Chat
      id={chatId}
      data={{ flowId: flow.id }}
      type="flo"
      domain="application"
      title={flow.title}
      subtitle="Grant application"
      user={user}
    >
      {(chat) => (
        <div className="flex h-full flex-col items-center justify-center px-4">
          <Image src={StartImage} alt="Let's start!" width={256} height={256} />
          <p className="mb-4 mt-8 text-center">Apply for {flow.title}</p>
          <Button
            onClick={() => {
              if (recipientExists) {
                toast.error("You have already applied to this flow")
                return
              }

              chat.append({
                role: "user",
                content: `Hi, I want to apply for a grant in ${flow.title}... Can we start the application?`,
              })
            }}
            size="xl"
            loading={chat.isLoading}
          >
            Let&apos;s start!
          </Button>
          <div className="mt-2.5 text-center">
            <Link
              href={`/apply/${flow.id}/manual`}
              className="text-xs text-muted-foreground hover:underline"
            >
              Apply manually
            </Link>
          </div>
        </div>
      )}
    </Chat>
  )
}
