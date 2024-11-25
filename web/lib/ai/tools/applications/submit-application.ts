import { tool } from "ai"
import { z } from "zod"
import { createDraft } from "./create-draft"
import { getUserAddressFromCookie } from "@/lib/auth/get-user-from-cookie"

export const submitApplication = tool({
  parameters: z.object({
    flowId: z.string(),
    title: z.string(),
    descriptionMarkdown: z.string(),
    image: z.string(),
    tagline: z.string().optional(),
  }),
  description: "Submit the draft application for the builder you've been working with",
  execute: async ({ title, image, descriptionMarkdown, tagline, flowId }): Promise<string> => {
    const user = await getUserAddressFromCookie()
    if (!user) throw new Error("User not found")

    const draft = await createDraft({
      title,
      image,
      descriptionMarkdown,
      users: [user],
      tagline,
      flowId,
    })

    if (typeof draft === "string") {
      return draft
    }

    return draft?.id?.toString() || "Failed to get draft"
  },
})
