import { getUserDataPrompt } from "../../prompts/user-data/user-data"
import { floApplicationHelperPrompt } from "./domains/application-helper"
import { floUserGuidancePrompt } from "./domains/user-guidance"
import { floPersonalityPrompt } from "./personality"

export type FloDomain = "application" | "guidance"

export async function getFloPrompt(domain: FloDomain, address?: string) {
  let prompt = `${floPersonalityPrompt}\n`

  prompt += address ? await getUserDataPrompt(address) : ""

  prompt += getDomainPrompt(domain)

  return prompt
}

function getDomainPrompt(domain: FloDomain) {
  switch (domain) {
    case "application":
      return floApplicationHelperPrompt()
    case "guidance":
      return floUserGuidancePrompt()
    default:
      throw new Error(`Unsupported domain "${domain}"`)
  }
}
