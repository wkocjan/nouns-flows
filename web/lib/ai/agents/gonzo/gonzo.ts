import { ChatData } from "@/app/chat/chat-body"
import { queryEmbeddingsTool } from "@/lib/ai/tools/embeddings/tool"
import { getTools, getToolsPrompt, Tool } from "@/lib/ai/tools/tool"
import database from "@/lib/database/edge"
import { cache } from "react"
import { aboutPrompt } from "../../prompts/about"
import { getAllNounishCitizensPrompt } from "../../prompts/nounish-citizens"
import { getUserDataPrompt } from "../../prompts/user-data"
import { updateStoryTool } from "../../tools/stories/update-story"
import { Agent } from "../agent"
import { gonzoPersonalityPrompt } from "./personality"
import { canEditStory } from "@/lib/database/helpers"

export async function getGonzo(data: ChatData): Promise<Agent> {
  const tools: Tool[] = [queryEmbeddingsTool]

  if (data.storyId && data.address) {
    const story = await getStory(data.storyId)

    if (story && canEditStory(story, data.address)) {
      tools.push(updateStoryTool)
    }
  }

  return {
    prompt: await getFloPrompt(data, tools),
    tools: getTools(tools),
  }
}

async function getFloPrompt(data: ChatData, tools: Tool[]) {
  let prompt = `${aboutPrompt}\n\n`
  prompt += `${gonzoPersonalityPrompt}\n`
  prompt += await getStoryPrompt(data.storyId)
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

async function getStoryPrompt(storyId: string | undefined) {
  if (!storyId) return ""

  const story = await getStory(storyId)
  if (!story) return ""

  return `\n\n## Story:\nContext about the current story:\n${JSON.stringify(story, null, 2)}`
}

const getStory = cache(async (storyId: string) => {
  return database.story.findFirst({ where: { id: storyId } })
})
