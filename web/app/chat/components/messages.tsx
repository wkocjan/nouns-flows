import { DotLoader } from "@/components/ui/dot-loader"
import { useEffect, useRef } from "react"
import { useAgentChat } from "./agent-chat"
import { ErrorMessage } from "./error-message"
import { MessageItem } from "./message-item"

export const Messages = () => {
  const { messages, error, append, restart, isLoading, type } = useAgentChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isInitialLoad = useRef(true)

  // Scroll to bottom only on initial load
  useEffect(() => {
    if (isInitialLoad.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      isInitialLoad.current = false
    }
  }, [messages])

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 md:pt-6">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          type={type}
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

      {isLoading && messages[messages.length - 1].role === "user" && (
        <div className="flex justify-center">
          <DotLoader />
        </div>
      )}

      <div ref={messagesEndRef} className="min-h-[24px] min-w-[24px] shrink-0" />
    </div>
  )
}
