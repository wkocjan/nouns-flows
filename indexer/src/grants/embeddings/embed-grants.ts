import { Schema } from "@/generated"
import { postToEmbeddingsQueueRequest } from "../../queue/client"
import { JobBody } from "../../queue/job"
import { RecipientType } from "../../enums"
import { getNonzeroLowercasedAddresses } from "../../queue/helpers"
import { deleteEmbeddingRequest } from "../../queue/client"
import { getContentHash } from "../../hash"
import { cleanTextForEmbedding } from "../../clean"

export async function addGrantEmbedding(grant: Schema["Grant"], recipientType: RecipientType) {
  if (recipientType === RecipientType.ExternalAccount) {
    return embedGrant(grant)
  }
  if (recipientType === RecipientType.FlowContract) {
    return embedFlowContract(grant)
  }

  throw new Error("Invalid recipient type")
}

export async function removeGrantEmbedding(grant: Schema["Grant"]) {
  const content = getGrantContent(grant)
  const type = grant.isFlow ? "flow" : "grant"
  const contentHash = getContentHash(content, type)
  await deleteEmbeddingRequest(contentHash, type)
}

const getGrantContent = (grant: Schema["Grant"]) => {
  return `This is an approved grant submitted by ${grant.submitter} for ${
    grant.recipient
  }. Here is the grant data: ${JSON.stringify(grant)}`
}

async function embedGrant(grant: Schema["Grant"]) {
  const users = getNonzeroLowercasedAddresses([grant.recipient, grant.submitter])

  const content = getGrantContent(grant)

  const payload: JobBody = {
    type: "grant",
    content,
    groups: ["nouns"],
    users,
    tags: ["flows"],
  }

  await postToEmbeddingsQueueRequest(payload)
}

const getFlowContractContent = (grant: Schema["Grant"]) => {
  const cleanedGrant = cleanTextForEmbedding(JSON.stringify(grant))
  return `this is a flow contract budget that people can apply for. here is the flow data: ${cleanedGrant}`
}

async function embedFlowContract(grant: Schema["Grant"]) {
  const users = getNonzeroLowercasedAddresses([grant.recipient, grant.submitter])

  const content = getFlowContractContent(grant)

  const payload: JobBody = {
    type: "flow",
    content,
    groups: ["nouns"],
    users,
    tags: ["flows"],
  }

  await postToEmbeddingsQueueRequest(payload)
}
