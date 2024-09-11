import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { explorerUrl } from "@/lib/utils"
import { HoverCardPortal } from "@radix-ui/react-hover-card"
import { ExternalLinkIcon } from "@radix-ui/react-icons"
import { PropsWithChildren } from "react"
import { base } from "viem/chains"
import { Profile } from "./get-user-profile"

interface Props {
  profile: Profile
}

export const UserProfilePopover = (props: PropsWithChildren<Props>) => {
  const { profile, children } = props

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent className="w-72">
          <div className="flex items-center space-x-2.5 whitespace-normal">
            <Avatar className="size-10">
              <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
              <AvatarFallback>
                {profile.display_name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="flex items-center text-sm font-semibold">
                {profile.display_name}
                <a
                  href={explorerUrl(profile.address, base.id, "address")}
                  className="ml-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  target="_blank"
                >
                  <ExternalLinkIcon className="size-3.5" />
                </a>
              </h4>
              {profile.bio && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  )
}
