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
  "builder-profile",
] as const

export enum EmbeddingTag {
  Flows = "flows",
  Drafts = "drafts",
  Grants = "grants",
}

export const validTags = [EmbeddingTag.Flows, EmbeddingTag.Drafts, EmbeddingTag.Grants] as const
