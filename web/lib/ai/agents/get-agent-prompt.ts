import { getFarcasterPrompt } from "../prompts/user-data/farcaster"
import { floApplicationHelperPrompt } from "./flo/application-helper"

type AgentType = "flo"
type AgentDomain = "application"

export async function getAgentPrompt(
  agentType: AgentType,
  domain: AgentDomain,
  request: Request,
  address: string,
): Promise<string> {
  const farcasterPrompt = await getFarcasterPrompt(address)

  if (agentType === "flo" && domain === "application") {
    return floApplicationHelperPrompt(request, address, farcasterPrompt)
  }

  throw new Error(`Unsupported agent type "${agentType}" or domain "${domain}"`)
}
