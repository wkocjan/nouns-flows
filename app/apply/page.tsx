import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MarkdownInput } from "@/components/ui/markdown-input"

export default async function ApplyPage() {
  return (
    <main className="container mt-2.5 md:mt-6">
      <div className="lg:w-1/2">
        <Card>
          <CardHeader>
            <CardTitle>Apply for a grant</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <Input placeholder="Enter title..." />
              <MarkdownInput name="description" />
              <Button variant="default">Send application</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
