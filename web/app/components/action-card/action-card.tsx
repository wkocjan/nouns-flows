import "server-only"

import { Button } from "@/components/ui/button"
import { Markdown } from "@/components/ui/markdown"
import { User } from "@/lib/auth/user"
import { kv } from "@vercel/kv"
import Link from "next/link"
import { AnimatedGuidance } from "./animated-guidance"
import { getGuidanceCacheKey, guidanceSchema } from "./guidance-utils"
import { cookies } from "next/headers"
import { GuidanceChat } from "./guidance-chat"
import { AgentChatProvider } from "@/app/chat/components/agent-chat"

interface Props {
  user?: User
}

export async function ActionCard(props: Props) {
  const { user } = props

  const cachedGuidance = await kv.get(getGuidanceCacheKey(user?.address))

  if (!cachedGuidance || (!user && !cookies().has("guidance-guest"))) {
    return <AnimatedGuidance user={user} />
  }

  const { text, actions } = guidanceSchema.parse(cachedGuidance)

  return (
    <AgentChatProvider id={"test-currently"} type="flo" domain="guidance" user={user}>
      <h2 className="text-lg font-semibold text-secondary-foreground">gm {user?.username}</h2>
      <div className="mb-5 mt-2.5 space-y-4 text-sm text-secondary-foreground/75 [&>*]:leading-loose">
        <Markdown>{text}</Markdown>
      </div>

      {/* <div className="mt-5 space-x-2.5">
        {actions?.map((action) => (
          <Button key={action?.link} variant="ai-secondary" size="md">
            <Link href={action?.link || "#"}>{action?.text}</Link>
          </Button>
        ))}
      </div> */}

      <GuidanceChat user={user} />
    </AgentChatProvider>
  )
}
