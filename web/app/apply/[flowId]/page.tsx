import "server-only"

import { Card, CardContent } from "@/components/ui/card"
import { ApplyForm } from "./components/ApplyForm"
import database from "@/lib/database"

interface Props {
  params: {
    flowId: string
  }
}

export default async function ApplyFlowPage(props: Props) {
  const { flowId } = props.params

  const flow = await database.grant.findFirstOrThrow({
    where: { id: flowId, isFlow: 1 },
  })

  return (
    <main className="container mt-8 pb-12">
      <h3 className="font-semibold leading-none tracking-tight">
        Apply for a Grant
      </h3>
      <p className="mt-1.5 text-balance text-sm text-muted-foreground">
        Outline your project and its potential impact.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <ApplyForm flowId={flowId} />
          </CardContent>
        </Card>
        <div className="lg:pr-8">
          <div>
            <h4 className="text-lg font-medium">{flow.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{flow.tagline}</p>
          </div>
          <div className="mt-6 space-y-2">
            <h5 className="text-sm font-medium">Requirements:</h5>
            <ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-muted-foreground">
              <li>
                Ensure your proposal aligns with the category&apos;s goals and
                objectives.
              </li>
              <li>
                Provide a clear and concise description of your project or
                initiative.
              </li>
              <li>
                Demonstrate how your project will benefit the Nouns community
                and ecosystem.
              </li>
            </ul>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Please review all requirements carefully before submitting your
            application. Incomplete or non-compliant applications may not be
            considered.
          </p>
        </div>
      </div>
    </main>
  )
}
