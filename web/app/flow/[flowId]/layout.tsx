import "server-only"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { NOUNS_FLOW_PROXY } from "@/lib/config"
import { getGrantsForCategory } from "@/lib/data/grants"
import database from "@/lib/database"
import { PropsWithChildren } from "react"
import { base } from "viem/chains"
import { FlowHeader } from "./components/flow-header"
import { FlowSubmenu } from "./components/flow-submenu"
import { VotingProvider } from "./components/voting-context"

interface Props {
  params: {
    flowId: string
  }
}
export default async function FlowLayout(props: PropsWithChildren<Props>) {
  const { children } = props
  const { flowId } = props.params

  const flow = await database.grant.findFirstOrThrow({
    where: { id: flowId, isFlow: 1 },
  })

  const grants = getGrantsForCategory(flowId)

  return (
    <VotingProvider
      chainId={base.id}
      userVotes={[]}
      contract={NOUNS_FLOW_PROXY}
    >
      <div className="container mt-2.5 pb-24 md:mt-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Categories</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{flow.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <FlowHeader flow={flow} />

        <FlowSubmenu
          flowId={flowId}
          awaitingCount={grants.filter((g) => !g.isApproved).length}
        />

        {children}
      </div>
    </VotingProvider>
  )
}
