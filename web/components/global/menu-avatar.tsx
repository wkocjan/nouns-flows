"use client"

import { Button } from "@/components/ui/button"
import { useVotingPower } from "@/lib/voting/use-voting-power"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Avatar, ConnectKitButton } from "connectkit"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { MAX_VOTING_POWER } from "@/lib/config"

export const MenuAvatar = () => {
  const { votingPower } = useVotingPower()

  return (
    <div className="inline-flex min-w-14">
      <ConnectKitButton.Custom>
        {({ isConnected, show, truncatedAddress, ensName, address }) => {
          return (
            <>
              {isConnected && (
                <div className="flex items-center space-x-0.5">
                  <button
                    onClick={show}
                    className="flex h-[26px] items-center space-x-1.5 rounded-full bg-secondary pr-2.5 transition-opacity hover:bg-accent"
                  >
                    <Avatar address={address} size={26} name={ensName || truncatedAddress} />
                    <span className="min-w-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                      {votingPower?.toString()}
                    </span>
                  </button>
                  {votingPower > MAX_VOTING_POWER && (
                    <HoverCard openDelay={0}>
                      <HoverCardTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <ExclamationTriangleIcon className="size-4" />
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent
                        collisionPadding={32}
                        className="w-full max-w-96 text-pretty text-sm"
                      >
                        Voting power is calculated on the mainnet, but Flows use the Base. Due to
                        current limitations, voting transactions fail when representing more than 6
                        nouns.
                        <br />
                        <br /> Therefore, you will be voting with a maximum of{" "}
                        {MAX_VOTING_POWER.toString()} votes.
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </div>
              )}
              {!isConnected && (
                <Button variant="outline" onClick={show}>
                  Connect Wallet
                </Button>
              )}
            </>
          )
        }}
      </ConnectKitButton.Custom>
    </div>
  )
}
