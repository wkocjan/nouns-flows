import { FloDomain, getFloPrompt } from "./flo/flo"

type AgentType = "flo"
type AgentDomain = FloDomain

export async function getAgentPrompt(
  type: AgentType,
  domain: AgentDomain,
  address?: string,
): Promise<string> {
  switch (type) {
    case "flo":
      return getFloPrompt(domain satisfies FloDomain, address)
    default:
      throw new Error(`Unsupported agent "${type}"`)
  }
}
