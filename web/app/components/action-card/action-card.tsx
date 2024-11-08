import "server-only"

import { Button } from "@/components/ui/button"
import { Markdown } from "@/components/ui/markdown"
import { User } from "@/lib/auth/user"
import { unstable_cache } from "next/dist/server/web/spec-extension/unstable-cache"
import Link from "next/link"
import { getGuidance } from "./get-guidance"

interface Props {
  user?: User
}

export async function ActionCard(props: Props) {
  const { user } = props

  const { text, actions } = await unstable_cache(
    async () => getGuidance(user?.address),
    [`guidance_${user?.address ?? "guest"}`],
    { revalidate: 1800 },
  )()

  if (!text) return null

  return (
    <div className="relative isolate row-span-2 overflow-hidden rounded-2xl bg-gradient-to-b from-secondary to-secondary/80 p-4">
      <h2 className="text-lg font-semibold text-secondary-foreground">gm {user?.username}</h2>
      <div className="mt-2.5 space-y-4 text-sm leading-loose text-secondary-foreground/75">
        <Markdown>{text}</Markdown>
      </div>

      <div className="mt-5 space-x-2.5">
        {actions.map((action) => (
          <Button key={action.link} asChild>
            <Link href={action.link}>{action.text}</Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
