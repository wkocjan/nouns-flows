"use server"

import database from "@/lib/database"
import { z } from "zod"

const schema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().min(1, "Description is required"),
    image: z.string().trim().min(1, "Image is required"),
    flowId: z.string().trim().min(1, "Flow is required"),
    tagline: z.string().trim().max(100).optional(),
    isFlow: z.enum(["0", "1"]).transform((value) => value === "1"),
    requirements: z.preprocess((value) => value === "on", z.boolean().default(false)),
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
  .refine((data) => data.isFlow || data.requirements, {
    message: "Accept the requirements",
    path: ["requirements"],
  })

export async function saveDraft(formData: FormData, user?: `0x${string}`) {
  const validation = schema.safeParse({
    ...Object.fromEntries(formData),
    users: [user],
  })

  try {
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      console.error(errors)
      throw new Error(Object.values(errors).flat().join(", "))
    }

    const { requirements, ...rest } = validation.data

    await database.draft.create({
      data: { ...rest, isPrivate: false, isOnchain: false },
    })
    return { error: false }
  } catch (error) {
    return { error: (error as Error).message || "Failed to save draft" }
  }
}
