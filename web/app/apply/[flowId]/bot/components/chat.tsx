"use client"

import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom"
import { Grant } from "@prisma/client"
import { Attachment, Message as MessageType } from "ai"
import { useChat } from "ai/react"
import { useEffect, useState } from "react"
import { Message } from "./message"
import { MultimodalInput } from "./multimodal-input"
import { useChatHistory } from "./use-chat-history"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { SignupButton } from "@/components/global/signup-button"
import { LoginButton } from "@/components/global/login-button"

interface Props {
  flow: Grant
  initialMessages?: Array<MessageType>
}

export function Chat(props: Props) {
  const { flow } = props

  const { readChatHistory, storeChatHistory, chatId } = useChatHistory({ id: flow.id })
  const { address } = useAccount()
  const isAuthenticated = !!address

  const initialMessages = props.initialMessages || readChatHistory()

  const { messages, handleSubmit, input, setInput, isLoading, stop } = useChat({
    id: chatId,
    api: `/apply/${flow.id}/bot/chat`,
    body: { flowId: flow.id },
    initialMessages,
    initialInput: `Hi, I want to apply for a grant in ${flow.title}... Can we start the application?`,
    keepLastMessageOnError: true,
    // onFinish: () => {},
  })

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>()
  const [attachments, setAttachments] = useState<Array<Attachment>>([])

  useEffect(() => {
    storeChatHistory(messages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  return (
    <div className="flex h-[calc(100dvh-68px)] min-w-0 flex-col">
      <div
        ref={messagesContainerRef}
        className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-scroll md:pt-6"
      >
        {isAuthenticated ? (
          <>
            {messages.map((message) => (
              <Message
                key={message.id}
                role={message.role}
                content={message.content}
                attachments={message.experimental_attachments}
                toolInvocations={message.toolInvocations}
              />
            ))}

            <div ref={messagesEndRef} className="min-h-[24px] min-w-[24px] shrink-0" />
          </>
        ) : (
          <ConnectWallet />
        )}
      </div>

      <form
        className="mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:max-w-3xl md:pb-6"
        onSubmit={handleSubmit}
      >
        <MultimodalInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          disabled={!isAuthenticated}
          attachments={attachments}
          setAttachments={setAttachments}
        />
      </form>
    </div>
  )
}

const ConnectWallet = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2.5">
          <SignupButton size="lg" variant="default" />
          <LoginButton size="lg" variant="outline" />
        </div>
        <p className="text-sm text-muted-foreground">Please log in to continue</p>
      </div>
    </div>
  )
}
