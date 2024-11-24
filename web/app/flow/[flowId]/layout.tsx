import "server-only"

import { getFlowWithGrants } from "@/lib/database/queries/flow"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress } from "@/lib/utils"
import { VotingProvider } from "@/lib/voting/voting-context"
import { Metadata } from "next"
import { PropsWithChildren } from "react"
import { base } from "viem/chains"
import { FlowHeader } from "./components/flow-header"

export const runtime = "nodejs"

interface Props {
  params: Promise<{ flowId: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { flowId } = (await props.params)

  const pool = await getPool()
  const flow = await getFlowWithGrants(flowId)

  return { title: `${flow.title} - ${pool.title}`, description: flow.tagline }
}

export default async function FlowLayout(props: PropsWithChildren<Props>) {
  const { children } = props
  const { flowId } = (await props.params)

  const flow = await getFlowWithGrants(flowId)

  return (
    <VotingProvider chainId={base.id} contract={getEthAddress(flow.recipient)}>
      <div className="container mt-4 max-w-6xl md:mt-8">
        <FlowHeader flow={flow} />
      </div>

      <div className="container max-w-6xl pb-24">{children}</div>
    </VotingProvider>
  )
}
