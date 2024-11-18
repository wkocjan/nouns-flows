import "server-only"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress } from "@/lib/utils"
import { VotingProvider } from "@/lib/voting/voting-context"
import { Metadata } from "next"
import { PropsWithChildren } from "react"
import { base } from "viem/chains"
import { FlowHeader } from "./components/flow-header"
import { FlowSubmenu } from "./components/flow-submenu"
import { GrantsStories } from "./components/grants-stories"

export const runtime = "nodejs"

interface Props {
  params: {
    flowId: string
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { flowId } = props.params

  const pool = await getPool()
  const flow = await getFlowWithGrants(flowId)

  return { title: `${flow.title} - ${pool.title}`, description: flow.tagline }
}

export default async function FlowLayout(props: PropsWithChildren<Props>) {
  const { children } = props
  const { flowId } = props.params

  const flow = await getFlowWithGrants(flowId)

  const draftsCount = await database.draft.count({
    where: { flowId, isPrivate: false, isOnchain: false },
    ...getCacheStrategy(120),
  })

  return (
    <VotingProvider chainId={base.id} contract={getEthAddress(flow.recipient)}>
      <div className="container mt-2.5 pb-24 md:mt-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Flows</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{flow.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <FlowHeader flow={flow} />

        <GrantsStories />

        <FlowSubmenu
          flowId={flowId}
          flow={flow}
          isTopLevel={flow.isTopLevel === 1}
          grants={flow.subgrants}
          draftsCount={draftsCount}
        />

        {children}
      </div>
    </VotingProvider>
  )
}
