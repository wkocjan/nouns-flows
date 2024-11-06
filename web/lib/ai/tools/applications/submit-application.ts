import { z } from "zod"
import { tool } from "ai"
import { createDraft } from "./create-draft"

export const submitApplication = (flowId: string) =>
  tool({
    parameters: z.object({
      title: z.string(),
      descriptionMarkdown: z.string(),
      image: z.string(),
      tagline: z.string().optional(),
      users: z.array(z.string()),
    }),
    description: "Submit the draft application for the builder you've been working with",
    execute: async ({ title, image, descriptionMarkdown, users, tagline }): Promise<string> => {
      const draft = await createDraft({
        title,
        image,
        descriptionMarkdown,
        users,
        tagline,
        flowId,
      })

      console.log({ draft })

      if (typeof draft === "string") {
        return draft
      }

      return draft?.id?.toString() || "Failed to get draft"
    },
  })
