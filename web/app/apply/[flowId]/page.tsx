import "server-only"

import { Card, CardContent } from "@/components/ui/card"
import { Markdown } from "@/components/ui/markdown"
import database from "@/lib/database"
import { ApplyForm } from "./components/ApplyForm"

interface Props {
  params: {
    flowId: string
  }
}

export default async function ApplyFlowPage(props: Props) {
  const { flowId } = props.params

  const flow = await database.grant.findFirstOrThrow({
    where: { id: flowId, isFlow: 1, isRemoved: 0 },
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
          <div className="mt-6 space-y-2 text-sm">
            <Markdown>{flow.description}</Markdown>
          </div>
        </div>
      </div>
    </main>
  )
}
