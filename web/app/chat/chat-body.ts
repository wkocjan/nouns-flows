import { AgentDomain, AgentType } from "@/lib/ai/agents/agent"
import { Message } from "ai"

export type ChatBody = {
  id: string
  messages: Array<Message>
  type: AgentType
  domain: AgentDomain
  data: ChatData
}

export type ChatData = {
  address?: string
  flowId?: string
}