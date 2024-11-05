import { Draft } from "@prisma/client"
import { cleanTextForEmbedding } from "./utils"
import { getContentHash } from "./utils"
import { EmbeddingType, JobBody } from "../types/job"
import { deleteEmbeddingRequest, postToEmbeddingsQueueRequest } from "./queue"

export async function addDraftEmbedding(draft: Draft) {
  return embedDraft(draft)
}

export async function removeDraftEmbedding(draft: Draft) {
  const content = getDraftContent(draft)
  const type: EmbeddingType = "draft-application"
  const contentHash = getContentHash(content, type)
  await deleteEmbeddingRequest(contentHash, type)
}

export async function updateDraftEmbedding(oldDraft: Draft, newDraft: Draft) {
  await Promise.all([removeDraftEmbedding(oldDraft), addDraftEmbedding(newDraft)])
}

const getDraftContent = (draft: Draft) => {
  const cleanedDraft = cleanTextForEmbedding(
    JSON.stringify({
      title: draft.title,
      description: draft.description,
      tagline: draft.tagline,
    }),
  )
  return `This is a draft proposal. Here is the draft data: ${cleanedDraft}`
}

async function embedDraft(draft: Draft) {
  const users = draft.users.map((user) => user.toLowerCase())

  const content = getDraftContent(draft)

  const payload: JobBody = {
    type: "draft-application",
    content,
    groups: ["nouns"],
    users,
    tags: ["drafts"],
  }

  await postToEmbeddingsQueueRequest(payload)
}
