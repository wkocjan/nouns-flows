import { ChatData } from "@/app/chat/chat-body"
import { aboutPrompt } from "@/lib/ai/prompts/about/about"
import { getUserDataPrompt } from "@/lib/ai/prompts/user-data/user-data"
import { submitApplicationTool } from "@/lib/ai/tools/applications/tool"
import { queryEmbeddingsTool } from "@/lib/ai/tools/embeddings/tool"
import { getTools, getToolsPrompt, Tool } from "@/lib/ai/tools/tool"
import { Agent } from "../agent"
import { floApplicationHelperPrompt } from "./domains/application-helper"
import { floUserGuidancePrompt } from "./domains/user-guidance"
import { floPersonalityPrompt } from "./personality"

export type FloDomain = "application" | "guidance"

export async function getFlo(domain: FloDomain, data: ChatData): Promise<Agent> {
  const tools = [queryEmbeddingsTool, submitApplicationTool]

  return {
    prompt: await getFloPrompt(domain, data, tools),
    tools: getTools(tools),
  }
}

async function getFloPrompt(domain: FloDomain, data: ChatData, tools: Tool[]) {
  let prompt = `${aboutPrompt}\n\n`
  prompt += `${floPersonalityPrompt}\n`
  prompt += data.address ? await getUserDataPrompt(data.address) : ""
  prompt += await getFloDomain(domain, data)
  prompt += getToolsPrompt(tools)

  return prompt
}

async function getFloDomain(domain: FloDomain, data: ChatData) {
  switch (domain) {
    case "application":
      return await floApplicationHelperPrompt(data)
    case "guidance":
      return await floUserGuidancePrompt(data)
    default:
      throw new Error(`Unsupported domain "${domain}"`)
  }
}
