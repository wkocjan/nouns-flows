export interface JobBody {
  type: (typeof validTypes)[number]
  content: string
  groups: string[]
  users: string[]
  tags: string[]
}

export const validTypes = ["grant", "cast", "grant-application", "flow", "dispute", "draft"]
