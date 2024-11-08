import { CoreTool } from "ai"
import { FloDomain, getFlo } from "./flo/flo"
import { ChatData } from "@/app/chat/chat-body"

export type AgentType = "flo"
export type AgentDomain = FloDomain

export type Agent = {
  prompt: string
  tools: Record<string, CoreTool>
}

export async function getAgent(
  type: AgentType,
  domain: AgentDomain,
  data: ChatData,
): Promise<Agent> {
  switch (type) {
    case "flo":
      return getFlo(domain satisfies FloDomain, data)
    default:
      throw new Error(`Unsupported agent "${type}"`)
  }
}
