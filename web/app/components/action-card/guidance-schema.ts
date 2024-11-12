import { z } from "zod"

export const guidanceSchema = z.object({
  text: z.string().describe("The guidance message to the user."),
  actions: z
    .array(z.object({ text: z.string().max(12), link: z.string() }))
    .describe("Actions the user can take."),
})
