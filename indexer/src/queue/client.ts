import { JobBody } from "./job"

export async function postToEmbeddingsQueueRequest(payload: JobBody) {
  const response = await fetch(process.env.EMBEDDINGS_QUEUE_URL + "/add-job", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    console.error("Failed to post to embeddings queue:", await response.text())
  }
}

export async function deleteEmbeddingRequest(contentHash: string, type: string) {
  const response = await fetch(process.env.EMBEDDINGS_QUEUE_URL + "/delete-embedding", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contentHash,
      type,
    }),
  })

  if (!response.ok) {
    console.error("Failed to delete embedding:", await response.text())
  }
}
