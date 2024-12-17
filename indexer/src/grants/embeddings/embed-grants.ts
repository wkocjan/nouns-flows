import { postToEmbeddingsQueueRequest } from "../../queue/queue"
import { EmbeddingTag, JobBody } from "../../queue/job"
import { RecipientType } from "../../enums"
import { getNonzeroLowercasedAddresses } from "../../queue/helpers"
import { deleteEmbeddingRequest } from "../../queue/queue"
import { getContentHash } from "../../hash"
import { cleanTextForEmbedding } from "../../clean"
import { Grant } from "../../../types"

export function addGrantEmbedding(grant: Grant, recipientType: RecipientType) {
  if (recipientType === RecipientType.ExternalAccount) {
    return embedGrant(grant)
  }
  if (recipientType === RecipientType.FlowContract) {
    return embedFlowContract(grant)
  }

  throw new Error("Invalid recipient type")
}

export function removeGrantEmbedding(grant: Grant) {
  const content = getGrantContent(grant)
  const type = grant.isFlow ? "flow" : "grant"
  const contentHash = getContentHash(content, type)
  return deleteEmbeddingRequest(contentHash, type)
    .then(() => console.log(`Deleted embedding for grant ${grant.id}`))
    .catch((error) => console.error(`Failed to delete embedding for grant ${grant.id}:`, error))
}

const getGrantContent = (grant: Grant) => {
  return cleanTextForEmbedding(
    `This is an approved grant submitted by ${grant.submitter} for ${
      grant.recipient
    }. Here is the grant data: ${JSON.stringify({
      title: grant.title,
      description: grant.description,
      tagline: grant.tagline,
      isFlow: grant.isFlow,
    })}`
  )
}

function embedGrant(grant: Grant) {
  const users = getNonzeroLowercasedAddresses([grant.recipient])

  const content = getGrantContent(grant)

  const payload: JobBody = {
    type: "grant",
    content,
    groups: ["nouns"],
    users,
    tags: [EmbeddingTag.Grants],
    externalId: grant.id.toString(),
  }

  return postToEmbeddingsQueueRequest(payload)
    .then(() => console.log(`Created embedding for grant ${grant.id}`))
    .catch((error) => console.error(`Failed to create embedding for grant ${grant.id}:`, error))
}

const getFlowContractContent = (grant: Grant) => {
  const cleanedGrant = cleanTextForEmbedding(
    JSON.stringify({
      title: grant.title,
      description: grant.description,
      tagline: grant.tagline,
      isFlow: grant.isFlow,
    })
  )
  return `this is a flow contract budget that people can apply for. here is the flow data: ${cleanedGrant}`
}

function embedFlowContract(grant: Grant) {
  const users = getNonzeroLowercasedAddresses([grant.recipient])

  const content = getFlowContractContent(grant)

  const payload: JobBody = {
    type: "flow",
    content,
    groups: ["nouns"],
    users,
    tags: [EmbeddingTag.Flows],
    externalId: grant.id.toString(),
  }

  return postToEmbeddingsQueueRequest(payload)
    .then(() => console.log(`Created embedding for flow contract ${grant.id}`))
    .catch((error) =>
      console.error(`Failed to create embedding for flow contract ${grant.id}:`, error)
    )
}
