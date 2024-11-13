import { getUser } from "@/lib/auth/user"
import { getFlow } from "@/lib/database/queries/flow"
import { ApplicationChat } from "./components/application-chat"
import { getPageRuntime } from "@/lib/database/edge"

export const runtime = getPageRuntime()

interface Props {
  params: {
    flowId: string
  }
}

export default async function ApplyPage(props: Props) {
  const { flowId } = props.params

  const flow = await getFlow(flowId)
  const user = await getUser()

  return <ApplicationChat flow={flow} user={user} />
}
