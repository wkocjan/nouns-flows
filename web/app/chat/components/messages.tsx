import { DotLoader } from "@/components/ui/dot-loader"
import { useScrollToBottom } from "@/lib/hooks/use-scroll-to-bottom"
import { useEffect } from "react"
import { useAgentChat } from "./agent-chat"
import { ErrorMessage } from "./error-message"
import { MessageItem } from "./message-item"

export const Messages = () => {
  const { messages, error, append, restart, isLoading } = useAgentChat()
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>()

  // Scroll to bottom on initial load and when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, messagesEndRef])

  return (
    <div
      ref={messagesContainerRef}
      className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto md:pt-6"
    >
      {messages.map((message) => (
        <MessageItem
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
            restart()
            window.location.reload()
          }}
        />
      )}

      {isLoading && (
        <div className="flex justify-center">
          <DotLoader />
        </div>
      )}

      <div ref={messagesEndRef} className="min-h-[24px] min-w-[24px] shrink-0" />
    </div>
  )
}
