"use client"

import { AgentDomain, AgentType } from "@/lib/ai/agents/agent"
import { User } from "@/lib/auth/user"
import { Attachment, Message } from "ai"
import { useChat, UseChatHelpers } from "ai/react"
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react"
import { useChatHistory } from "./use-chat-history"

interface Props {
  id: string
  type: AgentType
  domain: AgentDomain
  user?: User
  data?: { flowId?: string }
  initialMessages?: Message[]
}

interface AgentChatContext extends UseChatHelpers {
  restart: () => void
  attachments: Attachment[]
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>
  user?: User
}

const AgentChatContext = createContext<AgentChatContext | undefined>(undefined)

export function AgentChatProvider(props: PropsWithChildren<Props>) {
  const { id, type, domain, user, data, initialMessages, children } = props
  const { readChatHistory, storeChatHistory, resetChatHistory } = useChatHistory({ id })
  const [attachments, setAttachments] = useState<Array<Attachment>>([])

  const chat = useChat({
    id,
    api: `/chat`,
    body: { type, domain, id, data },
    initialMessages: initialMessages || readChatHistory(),
    keepLastMessageOnError: true,
  })

  const restart = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset the conversation? This will clear the entire chat history.",
    )
    if (!confirmed) return
    resetChatHistory()
    chat.setMessages([])
    chat.reload()
  }

  useEffect(() => {
    storeChatHistory(chat.messages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.messages])

  return (
    <AgentChatContext.Provider value={{ ...chat, restart, attachments, setAttachments, user }}>
      {children}
    </AgentChatContext.Provider>
  )
}

export function useAgentChat() {
  const context = useContext(AgentChatContext)
  if (context === undefined) {
    throw new Error("useAgentChat must be used within an AgentChatProvider")
  }
  return context
}
