"use server"

import database from "@/lib/database/edge"
import { addDraftEmbedding } from "@/lib/embedding/embed-drafts"
import { z } from "zod"
import { unstable_after as after } from "next/server"

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

    // Check for existing draft with same title/description/users
    const existingDraft = await database.draft.findFirst({
      where: {
        title,
        description: descriptionMarkdown,
        users: {
          equals: users.map((user) => user.toLowerCase()),
        },
      },
    })

    if (existingDraft) {
      return existingDraft
    }

    const draft = await database.draft.create({
      data: {
        title,
        image,
        flowId,
        tagline,
        users: users.map((user) => user.toLowerCase()),
        isFlow: false,
        isPrivate: false,
        isOnchain: false,
        blocks: "",
        description: descriptionMarkdown,
      },
    })

    after(async () => {
      await addDraftEmbedding(draft, flowId)
    })

    return draft
  } catch (error) {
    console.error(error)
    return (error as Error).message
  }
}
