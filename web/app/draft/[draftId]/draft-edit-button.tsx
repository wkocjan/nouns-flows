"use client"

import { Button } from "@/components/ui/button"
import { Draft } from "@prisma/client"
import Link from "next/link"
import { useCanManageDraft } from "./use-can-manage-draft"

interface Props {
  draft: Draft
  edit?: boolean
}

export function DraftEditButton(props: Props) {
  const { draft, edit } = props
  const canEdit = useCanManageDraft(draft)
  if (!canEdit) return null

  if (edit) {
    return (
      <>
        <Link href={`/draft/${draft.id}`}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" form="draft-edit">
          Save
        </Button>
      </>
    )
  }

  return (
    <Link href={`/draft/${draft.id}?edit=true`}>
      <Button type="button" variant="secondary">
        Edit
      </Button>
    </Link>
  )
}
