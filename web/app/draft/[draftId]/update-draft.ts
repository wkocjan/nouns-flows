"use server"

import database from "@/lib/database"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  descriptionMarkdown: z.string().trim().min(1, "Description (Markdown) is required"),
  descriptionBlocks: z.string().trim().min(1, "Description is required"),
  // image: z.string().trim().min(1, "Image is required"),
})

export async function updateDraft(id: number, formData: FormData, user?: `0x${string}`) {
  const validation = schema.safeParse(Object.fromEntries(formData))

  try {
    const draft = await database.draft.findUnique({ where: { id, isOnchain: false } })

    if (!draft) throw new Error("Draft not found")

    if (!draft.users.some((address) => address === user?.toLowerCase())) {
      throw new Error("Failed to update draft")
    }

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      console.error(errors)
      throw new Error(Object.values(errors).flat().join(", "))
    }

    const { descriptionMarkdown, descriptionBlocks, ...rest } = validation.data

    await database.draft.update({
      where: { id, isOnchain: false },
      data: {
        ...rest,
        description: descriptionMarkdown,
        blocks: descriptionBlocks,
      },
    })

    revalidatePath(`/draft/${id}`)

    return { error: false }
  } catch (error) {
    return { error: (error as Error).message || "Failed to save draft" }
  }
}
