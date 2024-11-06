import { EmbeddingType, JobBody } from "./job"

export async function postToEmbeddingsQueueRequest(payload: JobBody) {
  if (!process.env.EMBEDDINGS_QUEUE_URL) {
    throw new Error("EMBEDDINGS_QUEUE_URL is not defined")
  }
  if (!process.env.EMBEDDINGS_QUEUE_API_KEY) {
    throw new Error("EMBEDDINGS_QUEUE_API_KEY is not defined")
  }

  const response = await fetch(process.env.EMBEDDINGS_QUEUE_URL + "/add-job", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.EMBEDDINGS_QUEUE_API_KEY,
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    console.log("Failed to post to embeddings queue:")
    console.log({ payload, EMBEDDINGS_QUEUE_URL: process.env.EMBEDDINGS_QUEUE_URL })
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
  if (!process.env.EMBEDDINGS_QUEUE_API_KEY) {
    throw new Error("EMBEDDINGS_QUEUE_API_KEY is not defined")
  }

  const response = await fetch(process.env.EMBEDDINGS_QUEUE_URL + "/delete-embedding", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.EMBEDDINGS_QUEUE_API_KEY,
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({
      contentHash,
      type,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error({ text })
    console.error("Failed to delete embedding:", text)
    throw new Error((text as any)?.message || "Failed to delete embedding")
  }
}
