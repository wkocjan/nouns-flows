"use client"

import { Button } from "@/components/ui/button"
import { FileInput } from "@/components/ui/file-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarkdownInput } from "@/components/ui/markdown-input"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAccount } from "wagmi"
import { saveDraft } from "./save-draft"

interface Props {
  flowId: string
}

export function ApplyForm(props: Props) {
  const { flowId } = props

  const { address } = useAccount()
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const result = await saveDraft(formData, address)
    if (result.error) {
      toast.error(result.error)
    } else {
      router.push(`/flow/${flowId}/drafts`)
      toast.success("Draft saved!")
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <input type="hidden" name="flowId" value={flowId} />
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input placeholder="My project..." name="title" />
        </div>

        <div className="space-y-1.5">
          <Label>Image (square)</Label>
          <FileInput name="image" accept="image/jpeg,image/png,image/webp,image/svg+xml" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <MarkdownInput
          name="description"
          initialContent={`
### Overview
Briefly describe the problem your project aims to solve.

### Impact
- Grow the Nouns ecosystem,
- Create value for the community,
- Do something that matters.

### Team
Introduce the key members of your team and their relevant experience.

### Additional Information
Include any other details that support your application.`}
          minHeight={420}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Save offchain
        </Button>
      </div>
    </form>
  )
}
