import { headers } from "next/headers"

export function getUserAgentPrompt(): string {
  const userAgent = headers().get("user-agent")
  if (!userAgent) return ""

  return `Here is the user agent: ${userAgent}. If the user is on mobile, you should be incredibly concise and to the point. They do not have a lot of time or space to read, so you must be incredibly concise and keep your questions and responses to them short in as few words as possible, unless they ask for clarification or it's otherwise necessary.`
}
