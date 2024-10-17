import "server-only"

import { Card, CardContent } from "@/components/ui/card"
import { Markdown } from "@/components/ui/markdown"
import { getFlow } from "@/lib/database/queries/flow"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Metadata } from "next"
import { ApplyForm } from "./components/apply-form"

interface Props {
  params: {
    flowId: string
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const flow = await getFlow(props.params.flowId)

  return {
    title: `Apply for a grant - ${flow.title}`,
    description: `Submit your grant application in ${flow.title} flow.`,
  }
}

export default async function ApplyFlowPage(props: Props) {
  const { flowId } = props.params

  const flow = await getFlow(flowId)
  const { isTopLevel } = flow

  return (
    <main className="container mt-8 pb-12">
      <h3 className="text-pretty font-semibold tracking-tight">
        {isTopLevel ? "Suggest new flow" : `Apply for a grant in "${flow.title}"`}
      </h3>
      <p className="mt-1.5 max-w-screen-md whitespace-pre-line text-balance text-sm text-muted-foreground">
        {isTopLevel
          ? "Suggest a new funding flow to help people make impact."
          : "Review guidelines below, outline your project, highlight its impact, and demonstrate how it meets the flow's requirements and objectives."}
      </p>
      <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <ApplyForm flow={flow} isFlow={isTopLevel === 1} />
          </CardContent>
        </Card>

        <div className="max-sm:order-first">
          <div className="rounded-lg border-2 border-dashed border-foreground/75 p-4 lg:p-5">
            <div className="flex items-center justify-between space-x-2">
              <h4 className="font-medium tracking-tight">Guidelines & requirements</h4>
              <ExclamationTriangleIcon className="size-6" />
            </div>
            <div className="mt-6 space-y-2.5 text-sm leading-normal">
              <Markdown>{flow.description}</Markdown>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
