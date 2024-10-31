"use client"

import { LoginButton } from "@/components/global/login-button"
import { SignupButton } from "@/components/global/signup-button"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom"
import { Grant } from "@prisma/client"
import { Attachment } from "ai"
import { useChat } from "ai/react"
import { RotateCcw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { Message } from "./message"
import { MultimodalInput } from "./multimodal-input"
import StartImage from "./start.svg"
import { useChatHistory } from "./use-chat-history"
import { ErrorMessage } from "./error-message"
import { toast } from "sonner"
import { useRecipientExists } from "../../components/useRecipientExists"

interface Props {
  flow: Grant
}

export function Chat(props: Props) {
  const { flow } = props
  const { address, isConnecting } = useAccount()
  const isAuthenticated = !!address && !isConnecting

  const { readChatHistory, storeChatHistory, resetChatHistory, chatId } = useChatHistory({
    id: flow.id,
  })

  const {
    messages,
    handleSubmit,
    input,
    setInput,
    isLoading,
    stop,
    reload,
    setMessages,
    append,
    error,
  } = useChat({
    id: chatId,
    api: `/apply/${flow.id}/bot/chat`,
    body: { flowId: flow.id, address, chatId },
    initialMessages: readChatHistory(),
    keepLastMessageOnError: true,
  })

  const restartApplication = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset the application? This will clear the entire chat history.",
    )
    if (!confirmed) return
    resetChatHistory()
    setMessages([])
    reload()
  }

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>()
  const [attachments, setAttachments] = useState<Array<Attachment>>([])
  const recipientExists = useRecipientExists(flow.recipient, address)

  useEffect(() => {
    storeChatHistory(messages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  // Scroll to bottom on initial load and when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, messagesEndRef])

  return (
    <div className="flex h-[calc(100dvh-68px)] min-w-0 flex-col">
      {messages.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 max-sm:pr-2 max-sm:pt-0 md:ml-4">
          <div className="md:flex md:grow md:flex-col md:items-center md:justify-center">
            <h1 className="text-sm font-medium">
              <Link href={`/flow/${flow.id}`} className="transition-colors hover:text-primary">
                {flow.title}
              </Link>
            </h1>
            <h3 className="text-xs text-muted-foreground">Grant application</h3>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={restartApplication}
                className="text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restart the application</TooltipContent>
          </Tooltip>
        </div>
      )}
      <div
        ref={messagesContainerRef}
        className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-scroll md:pt-6"
      >
        {isAuthenticated ? (
          <>
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center px-4">
                <Image src={StartImage} alt="Let's start!" width={256} height={256} />
                <p className="mb-4 mt-8 text-center">Application for {flow.title} grant</p>
                <Button
                  onClick={() => {
                    if (recipientExists) {
                      toast.error("You have already applied to this flow")
                      return
                    }

                    append({
                      role: "user",
                      content: `Hi, I want to apply for a grant in ${flow.title}... Can we start the application?`,
                    })
                  }}
                  size="lg"
                  loading={isLoading}
                >
                  Let&apos;s start!
                </Button>
              </div>
            )}

            {messages.map((message) => (
              <Message
                key={message.id}
                role={message.role}
                content={message.content}
                attachments={message.experimental_attachments}
                toolInvocations={message.toolInvocations}
              />
            ))}
            {error && (
              <ErrorMessage
                buttonText="Retry Application"
                error={error}
                onRetry={() => {
                  resetChatHistory()
                  window.location.reload()
                }}
              />
            )}

            <div ref={messagesEndRef} className="min-h-[24px] min-w-[24px] shrink-0" />
          </>
        ) : (
          <ConnectWallet />
        )}
      </div>

      {messages.length > 0 && (
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
      )}
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
