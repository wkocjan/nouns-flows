import { CoreMessage } from "ai"

export function extractAttachments(messages: Array<CoreMessage>): string[] {
  const attachments: string[] = []

  for (const message of messages) {
    if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if ("type" in content && content.type === "image" && "image" in content) {
          attachments.push(content.image.toString())
        }
      }
    }
  }

  return attachments
}
