"use client"

import { LoginButton } from "@/components/global/login-button"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AgentDomain, AgentType } from "@/lib/ai/agents/agent"
import { User } from "@/lib/auth/user"
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom"
import { Attachment } from "ai"
import { useChat, UseChatHelpers } from "ai/react"
import { RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { ErrorMessage } from "./error-message"
import { Message } from "./message"
import { MultimodalInput } from "./multimodal-input"
import { useChatHistory } from "./use-chat-history"

interface Props {
  type: AgentType
  domain: AgentDomain
  id: string
  title: string
  subtitle: string
  user?: User
  data?: {
    flowId?: string
  }
  children: (chat: UseChatHelpers) => React.ReactNode
}

export function Chat(props: Props) {
  const { id, title, subtitle, data, children, type, domain, user } = props

  const { readChatHistory, storeChatHistory, resetChatHistory } = useChatHistory({ id })

  const chat = useChat({
    id,
    api: `/chat`,
    body: { type, domain, id, data: { ...data, address: user?.address } },
    initialMessages: readChatHistory(),
    keepLastMessageOnError: true,
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
  } = chat

  const restart = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset the conversation? This will clear the entire chat history.",
    )
    if (!confirmed) return
    resetChatHistory()
    setMessages([])
    reload()
  }

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>()
  const [attachments, setAttachments] = useState<Array<Attachment>>([])

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
            {title && <h1 className="text-sm font-medium">{title}</h1>}
            {subtitle && <h3 className="text-xs text-muted-foreground">{subtitle}</h3>}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={restart}
                className="text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restart the conversation</TooltipContent>
          </Tooltip>
        </div>
      )}
      <div
        ref={messagesContainerRef}
        className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-scroll md:pt-6"
      >
        {user ? (
          <>
            {messages.length === 0 && <>{children(chat)}</>}

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
                buttonText="Reset"
                retryText="Retry"
                onRetry={() => {
                  append({ role: "user", content: "Please continue where we left off." })
                }}
                error={error}
                onReset={() => {
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
            disabled={!user}
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
          <LoginButton size="lg" />
        </div>
        <p className="text-sm text-muted-foreground">Please log in to continue</p>
      </div>
    </div>
  )
}
