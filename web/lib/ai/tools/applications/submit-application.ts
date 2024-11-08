import { tool } from "ai"
import { z } from "zod"
import { createDraft } from "./create-draft"

export const submitApplication = tool({
  parameters: z.object({
    flowId: z.string(),
    title: z.string(),
    descriptionMarkdown: z.string(),
    image: z.string(),
    tagline: z.string().optional(),
    users: z.array(z.string().describe("The wallet address of the user")),
  }),
  description: "Submit the draft application for the builder you've been working with",
  execute: async ({
    title,
    image,
    descriptionMarkdown,
    users,
    tagline,
    flowId,
  }): Promise<string> => {
    const draft = await createDraft({
      title,
      image,
      descriptionMarkdown,
      users,
      tagline,
      flowId,
    })

    if (typeof draft === "string") {
      return draft
    }

    return draft?.id?.toString() || "Failed to get draft"
  },
})
