export type EmbeddingType = (typeof validTypes)[number]

export interface JobBody {
  type: EmbeddingType
  content: string
  groups: string[]
  users: string[]
  tags: string[]
  externalId: string
}

export const validTypes = [
  "grant",
  "cast",
  "grant-application",
  "flow",
  "dispute",
  "draft-application",
] as const
