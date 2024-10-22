"use server"

import database from "@/lib/database"

export async function getComments(commentableId: string) {
  const comments = await database.comment.findMany({
    where: { commentableId, parentId: null },
    include: { replies: { include: { replies: true } } },
    orderBy: { createdAt: "desc" },
  })
  return { comments, error: null }
}

export async function addComment(
  commentableId: string,
  content: string,
  author: string,
  parentId?: string,
) {
  try {
    const comment = await database.comment.create({
      data: { commentableId, content, author, parentId },
    })
    return { comment, error: null }
  } catch (error) {
    console.error(error)
    return { comment: null, error: "Failed to create comment. Try again." }
  }
}
