import { ChatData } from "@/app/chat/chat-body"
import { submitApplicationTool } from "@/lib/ai/tools/applications/tool"
import { queryEmbeddingsTool } from "@/lib/ai/tools/embeddings/tool"
import { getTools, getToolsPrompt, Tool } from "@/lib/ai/tools/tool"
import { aboutPrompt } from "../../prompts/about"
import { getUserDataPrompt } from "../../prompts/user-data"
import { applicationTemplateTool } from "../../tools/application-template/tool"
import { Agent } from "../agent"
import { floPersonalityPrompt } from "./personality"
import { getAllNounishCitizensPrompt } from "../../prompts/nounish-citizens"

export async function getFlo(data: ChatData): Promise<Agent> {
  const tools = [queryEmbeddingsTool, submitApplicationTool, applicationTemplateTool]

  return {
    prompt: await getFloPrompt(data, tools),
    tools: getTools(tools),
  }
}

async function getFloPrompt(data: ChatData, tools: Tool[]) {
  let prompt = `${aboutPrompt}\n\n`
  prompt += `${floPersonalityPrompt}\n`
  prompt += await getUserDataPrompt(data.address)
  prompt += getDataPrompt(data)
  prompt += await getAllNounishCitizensPrompt()
  prompt += getToolsPrompt(tools)

  return prompt
}

function getDataPrompt(data: ChatData) {
  if (!data || Object.keys(data).length === 0) return ""
  return `\n\n# Additional data:\n${JSON.stringify(data, null, 2)}`
}
