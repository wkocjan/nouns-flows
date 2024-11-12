import { z } from "zod"

export const guidanceSchema = z.object({
  text: z.string().describe("The guidance message to the user."),
  actions: z
    .array(z.object({ text: z.string().max(12), link: z.string() }))
    .describe("Actions the user can take."),
})

export function getGuidanceCacheKey(address: `0x${string}` | undefined) {
  return `guidance-${address?.toLowerCase() || "guest"}`
}
