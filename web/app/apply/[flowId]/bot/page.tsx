import { getFlow } from "@/lib/database/queries/flow"
import { Chat } from "./components/chat"

interface Props {
  params: {
    flowId: string
  }
}

export default async function ApplyBotPage(props: Props) {
  const { flowId } = props.params
  const flow = await getFlow(flowId)

  // TODO: Do not show chat to guests

  return <Chat flow={flow} />
}
