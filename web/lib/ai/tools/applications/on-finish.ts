import { CoreMessage } from "ai"
import { extractAttachments } from "@/lib/ai/utils/attachments"
import database from "@/lib/database/edge"

export async function onFinishApplicationChat({
  responseMessages,
  coreMessages,
  flowId,
  chatId,
  address,
}: {
  responseMessages: CoreMessage[]
  coreMessages: CoreMessage[]
  flowId: string
  chatId: string
  address: string
}) {
  const allMessages = [...coreMessages, ...responseMessages]

  const attachments = extractAttachments(allMessages)

  const application = await database.application.upsert({
    where: { id: chatId },
    create: { id: chatId, flowId, messages: JSON.stringify(allMessages), user: address },
    update: { messages: JSON.stringify(allMessages), attachments: JSON.stringify(attachments) },
  })

  console.debug(`Stored ${allMessages.length} messages in ${application.id}`)
}
