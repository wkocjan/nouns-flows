"use client"

import { Card, CardContent } from "@/components/ui/card"
import { SkeletonLoader } from "@/components/ui/skeleton"
import { useVoting } from "@/lib/voting/voting-context"
import { Grant } from "@prisma/flows"
import { ReactNode, Suspense } from "react"
import { FlowCard } from "./flow-card"
import { FlowsTable } from "./flows-table"

interface Props {
  flows: Array<Grant & { subgrants: Grant[] }>
  actionCard: ReactNode
}

export default function FlowsList(props: Props) {
  const { flows, actionCard } = props
  const { isActive } = useVoting()

  if (isActive) {
    return (
      <Card>
        <CardContent>
          <FlowsTable flows={flows} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div className="relative isolate row-span-2 overflow-hidden rounded-2xl bg-gradient-to-b from-secondary to-secondary/80 p-5">
        <Suspense fallback={<SkeletonLoader count={5} height={24} />}>{actionCard}</Suspense>
      </div>
      {flows.map((flow) => (
        <FlowCard key={flow.id} flow={flow} />
      ))}
    </div>
  )
}
