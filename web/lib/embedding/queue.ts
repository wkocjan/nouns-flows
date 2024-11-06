import { EmbeddingType, JobBody } from "../types/job"

export async function postToEmbeddingsQueueRequest(payload: JobBody) {
  if (!process.env.EMBEDDINGS_QUEUE_URL) {
    throw new Error("EMBEDDINGS_QUEUE_URL is not defined")
  }

  const response = await fetch(process.env.EMBEDDINGS_QUEUE_URL + "/add-job", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  if (!response.ok) {
    const text = await response.text()
    console.error({ text })
    console.error("Failed to post to embeddings queue:", text)
    throw new Error((text as any)?.message || "Failed to post to embeddings queue")
  }
}

export async function deleteEmbeddingRequest(contentHash: string, type: EmbeddingType) {
  if (!process.env.EMBEDDINGS_QUEUE_URL) {
    throw new Error("EMBEDDINGS_QUEUE_URL is not defined")
  }

  const response = await fetch(process.env.EMBEDDINGS_QUEUE_URL + "/delete-embedding", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contentHash,
      type,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const text = await response.text()
    console.error({ text })
    console.error("Failed to delete embedding:", text)
    throw new Error((text as any)?.message || "Failed to delete embedding")
  }
}
