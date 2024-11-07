import { getFarcasterPrompt } from "./farcaster"
import { cache } from "react"

export const getUserDataPrompt = cache(async (address: string) => {
  return `# User data
  
  The address of the user is ${address}. 
  
  ${await getFarcasterPrompt(address)}
  `
})
