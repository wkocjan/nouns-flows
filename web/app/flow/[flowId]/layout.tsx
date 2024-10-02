import "server-only"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getEthAddress } from "@/lib/utils"
import { VotingProvider } from "@/lib/voting/voting-context"
import { PropsWithChildren } from "react"
import { base } from "viem/chains"
import { FlowHeader } from "./components/flow-header"
import { FlowSubmenu } from "./components/flow-submenu"
import { getFlowWithGrants } from "@/lib/database/queries/flow"

interface Props {
  params: {
    flowId: string
  }
}
export default async function FlowLayout(props: PropsWithChildren<Props>) {
  const { children } = props
  const { flowId } = props.params

  const flow = await getFlowWithGrants(flowId)

  return (
    <VotingProvider chainId={base.id} contract={getEthAddress(flow.recipient)}>
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

        <FlowSubmenu flowId={flowId} flow={flow} isTopLevel={flow.isTopLevel === 1} />

        {children}
      </div>
    </VotingProvider>
  )
}
