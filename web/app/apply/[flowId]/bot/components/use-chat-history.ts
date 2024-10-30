"use client"

import { Message } from "ai"
import { useAccount } from "wagmi"

interface Props {
  id: string
}

export function useChatHistory(props: Props) {
  const { id } = props
  const { address } = useAccount()

  const chatId = `chat-${id}-${address?.toLowerCase()}`

  function readChatHistory(): Message[] {
    if (typeof window === "undefined") return []

    try {
      return JSON.parse(localStorage.getItem(chatId) || "[]")
    } catch (error) {
      console.error("Failed to parse chat history:", error)
      return []
    }
  }

  function storeChatHistory(messages: Message[]) {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(chatId, JSON.stringify(messages))
    } catch (error) {
      console.error("Failed to store chat history:", error)
    }
  }

  function resetChatHistory() {
    if (typeof window === "undefined") return
    localStorage.removeItem(chatId)
  }

  return {
    readChatHistory,
    storeChatHistory,
    resetChatHistory,
    chatId,
  }
}
