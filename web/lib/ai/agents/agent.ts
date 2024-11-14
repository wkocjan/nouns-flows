import { ChatData } from "@/app/chat/chat-body"
import { CoreTool } from "ai"
import { getFlo } from "./flo/flo"

export type AgentType = "flo"

export type Agent = {
  prompt: string
  tools: Record<string, CoreTool>
}

export async function getAgent(type: AgentType, data: ChatData): Promise<Agent> {
  switch (type) {
    case "flo":
      return getFlo(data)
    default:
      throw new Error(`Unsupported agent "${type}"`)
  }
}
