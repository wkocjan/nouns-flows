import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FileInput } from "@/components/ui/file-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarkdownInput } from "@/components/ui/markdown-input"

export default async function ApplyPage() {
  return (
    <main className="container mt-2.5 md:mt-6">
      <div className="lg:w-1/2">
        <Card>
          <CardHeader>
            <CardTitle>Apply for a grant</CardTitle>
            <CardDescription>Some additional information here.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input placeholder="Enter title..." name="title" />
              </div>

              <div className="space-y-1">
                <Label>Description</Label>
                <MarkdownInput
                  name="description"
                  initialContent={`- Do this\n\r- Don't do that`}
                />
              </div>

              <div className="max-w-sm space-y-1">
                <Label>Image</Label>
                <FileInput
                  name="imageUrl"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                />
              </div>

              <Button variant="default">Send application</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
