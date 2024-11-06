import { getLocationPrompt } from "../../prompts/user-data/location"
import { getUserAgentPrompt } from "../../prompts/user-data/user-agent"
import { floSystemPrompt } from "./personality"

export const floApplicationHelperPrompt = (
  request: Request,
  address: string,
  farcasterPrompt: string,
) => `
# Your personality as a helpful assistant
${floSystemPrompt}

# User data
${getUserAgentPrompt(request)}
${getLocationPrompt(request)} Make sure the final application you output and submit is in English.
The address of the user is ${address}.
${farcasterPrompt}

# Your abilities
You cannot view the internet, you cannot search the internet, you cannot access any external links.
You can only use the tools provided to you.
`
