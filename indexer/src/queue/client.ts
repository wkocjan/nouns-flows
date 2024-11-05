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
