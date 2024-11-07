import "server-only"

import { Button } from "@/components/ui/button"
import { Markdown } from "@/components/ui/markdown"
import { User } from "@/lib/auth/user"
import Link from "next/link"
import { getGuidance } from "./get-guidance"

interface Props {
  user?: User
}

export async function ActionCard(props: Props) {
  const { user } = props

  const { text, actions } = await getGuidance(user?.address)

  return (
    <div className="relative isolate row-span-2 overflow-hidden rounded-2xl bg-gradient-to-b from-secondary to-secondary/80 p-4">
      <h2 className="text-lg font-semibold text-secondary-foreground">gm {user?.username}</h2>
      <div className="mt-2.5 space-y-4 text-sm leading-loose text-secondary-foreground/75">
        <Markdown>{text}</Markdown>
      </div>

      {actions.map((action) => (
        <Button key={action.link} className="mt-5" asChild>
          <Link href={action.link}>{action.text}</Link>
        </Button>
      ))}
    </div>
  )
}
