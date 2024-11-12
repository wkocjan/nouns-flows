import "server-only"

import { Button } from "@/components/ui/button"
import { Markdown } from "@/components/ui/markdown"
import { User } from "@/lib/auth/user"
import { kv } from "@vercel/kv"
import Link from "next/link"
import { AnimatedGuidance } from "./animated-guidance"
import { getGuidanceCacheKey, guidanceSchema } from "./guidance-utils"
import { cookies } from "next/headers"

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
    <>
      <h2 className="text-lg font-semibold text-secondary-foreground">gm {user?.username}</h2>
      <div className="mt-2.5 space-y-4 text-sm text-secondary-foreground/75 [&>*]:leading-loose">
        <Markdown>{text}</Markdown>
      </div>

      <div className="mt-5 space-x-2.5">
        {actions?.map((action) => (
          <Button key={action?.link} asChild>
            <Link href={action?.link || "#"}>{action?.text}</Link>
          </Button>
        ))}
      </div>
    </>
  )
}
