"use server"

import database from "@/lib/database"

export async function updateDraft(id: number, transactionHash: string) {
  try {
    await database.draft.update({
      where: { id, isOnchain: false },
      data: { transactionHash, isOnchain: true },
    })
    return { error: false }
  } catch (error) {
    return { error: (error as Error).message || "Failed to save draft" }
  }
}
