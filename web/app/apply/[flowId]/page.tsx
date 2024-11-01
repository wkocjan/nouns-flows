import { getFlow } from "@/lib/database/queries/flow"
import { Chat } from "./components/chat"

interface Props {
  params: {
    flowId: string
  }
}

export default async function ApplyPage(props: Props) {
  const { flowId } = props.params
  const flow = await getFlow(flowId)

  return <Chat flow={flow} />
}
