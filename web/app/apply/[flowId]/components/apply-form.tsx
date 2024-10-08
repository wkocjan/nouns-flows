"use client"

import { Button } from "@/components/ui/button"
import { FileInput } from "@/components/ui/file-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarkdownInput } from "@/components/ui/markdown-input"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { useAccount } from "wagmi"
import { saveDraft } from "./save-draft"

interface Props {
  flowId: string
  isFlow: boolean
}

export function ApplyForm(props: Props) {
  const { flowId, isFlow } = props

  const { address } = useAccount()
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const result = await saveDraft(formData, address)
    if (result.error) {
      toast.error(result.error)
    } else {
      // wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push(`/flow/${flowId}/drafts`)
      toast.success("Draft saved! Redirecting...")
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <input type="hidden" name="flowId" value={flowId} />
        <input type="hidden" name="isFlow" value={isFlow ? "1" : "0"} />
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" />
        </div>

        <div className="space-y-1.5">
          <Label>Image (square)</Label>
          <FileInput name="image" accept="image/jpeg,image/png,image/webp,image/svg+xml" />
        </div>
      </div>

      {isFlow && (
        <div className="space-y-1.5">
          <Label htmlFor="tagline">Tagline</Label>
          <Input placeholder="Short and sweet" id="tagline" name="tagline" />
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Description</Label>
        <MarkdownInput
          name="description"
          initialContent={`
### Overview
Briefly describe the problem your project aims to solve.

### Impact
- Describe the impact of your project.
- Be specific
- What does the world look like if your project is successful?

### Team
Introduce the key members of your team and their relevant experience.

### Additional Information
Include any other details that support your application.`}
          minHeight={420}
        />
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" disabled={pending}>
      Save draft
    </Button>
  )
}
