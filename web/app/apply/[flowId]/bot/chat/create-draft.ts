"use server"

import database from "@/lib/database"
import { z } from "zod"

const draftSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  descriptionMarkdown: z.string().trim().min(1, "Description is required"),
  image: z.string().trim().min(1, "Image is required"),
  flowId: z.string().trim().min(1, "Flow is required"),
  tagline: z.string().trim().max(100).optional(),
  users: z
    .array(
      z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid user address"),
    )
    .min(1, "At least one user is required"),
})

export async function createDraft({
  title,
  descriptionMarkdown,
  image,
  flowId,
  tagline,
  users,
}: z.infer<typeof draftSchema>) {
  try {
    const validation = draftSchema.safeParse({
      title,
      descriptionMarkdown,
      image,
      flowId,
      tagline,
      users,
    })

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      throw new Error(Object.values(errors).flat().join(", "))
    }

    const draft = await database.draft.create({
      data: {
        title,
        image,
        flowId,
        tagline,
        users,
        isFlow: false,
        isPrivate: false,
        isOnchain: false,
        blocks: "",
        description: descriptionMarkdown,
      },
    })

    return draft
  } catch (error) {
    console.error(error)
    return (error as Error).message
  }
}
