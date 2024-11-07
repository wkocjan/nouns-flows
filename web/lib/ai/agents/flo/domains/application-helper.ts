import { getLocationPrompt } from "@/lib/ai/prompts/location/get-location-prompt"

export const floApplicationHelperPrompt = () => `
# Language and location
${getLocationPrompt()} Make sure the final application you output and submit is in English.

# Your abilities
You cannot view the internet, you cannot search the internet, you cannot access any external links.
You can only use the tools provided to you.
`
