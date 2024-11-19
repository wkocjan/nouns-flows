import "server-only"

import { EmptyState } from "@/components/ui/empty-state"
import { getUserProfiles } from "@/components/user-profile/get-user-profile"
import database from "@/lib/database/edge"
import { Status } from "@/lib/enums"
import { getEthAddress } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import { FlowSubmenu } from "./components/flow-submenu"
import GrantsList from "./components/grants-list"
import { GrantsStories } from "./components/grants-stories"
import { VotingBar } from "./components/voting-bar"

export const runtime = "nodejs"

interface Props {
  params: { flowId: string }
}

export default async function FlowPage(props: Props) {
  const { flowId } = props.params

  const flow = await database.grant.findFirstOrThrow({
    where: { id: flowId, isActive: 1 },
    include: { subgrants: { where: { isActive: 1 }, include: { derivedData: true } } },
  })

  if (!flow.subgrants || flow.subgrants.length === 0) {
    return <EmptyState title="No grants found" description="There are no approved grants yet" />
  }

  const profiles = await getUserProfiles(flow.subgrants.map((g) => getEthAddress(g.recipient)))

  return (
    <>
      <div className="mt-10">
        <GrantsStories flowId={flowId} />
      </div>

      <FlowSubmenu flowId={flowId} segment="approved" />

      <GrantsList
        flow={flow}
        grants={flow.subgrants
          .map((g) => ({
            ...g,
            profile: profiles.find((p) => p.address === getEthAddress(g.recipient))!,
          }))
          .sort(sortGrants)}
      />
      <VotingBar />
    </>
  )
}

function sortGrants(a: Grant, b: Grant) {
  const aIsClearingRequested = a.status === Status.ClearingRequested
  const bIsClearingRequested = b.status === Status.ClearingRequested
  if (aIsClearingRequested && !bIsClearingRequested) {
    return -1
  } else if (!aIsClearingRequested && bIsClearingRequested) {
    return 1
  } else {
    return Number(b.monthlyIncomingFlowRate) - Number(a.monthlyIncomingFlowRate)
  }
}
