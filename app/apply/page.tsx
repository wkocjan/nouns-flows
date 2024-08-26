import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ApplyPage() {
  return (
    <main className="container mt-2.5 md:mt-6">
      <div className="lg:w-1/2">
        <Card>
          <CardHeader>
            <CardTitle>Apply for a grant</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="max-w-80 space-y-4">
              <Input placeholder="Enter title..." />
              <Button variant="default">Send application</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
