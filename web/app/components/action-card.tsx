import { Button } from "@/components/ui/button"
import { User } from "@/lib/auth/user"

interface Props {
  user?: User
}

export default function ActionCard(props: Props) {
  const { user } = props

  return (
    <div className="relative isolate row-span-2 overflow-hidden rounded-2xl bg-gradient-to-b from-secondary to-secondary/80 p-5">
      <h2 className="text-lg font-semibold text-secondary-foreground">gm {user?.username}</h2>
      <p className="mt-2.5 text-sm leading-loose text-secondary-foreground/75">
        Happy to see you again. All your votes are belong to us.
      </p>
      <ul className="mt-2.5 list-inside list-disc space-y-2 text-sm text-secondary-foreground/75">
        <li>Check your active grants</li>
        <li>Review pending applications</li>
        <li>Explore new something</li>
      </ul>
      <Button className="mt-5">Do something &raquo;</Button>
    </div>
  )
}
