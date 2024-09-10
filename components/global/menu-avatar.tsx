"use client"

import { Button } from "@/components/ui/button"
import { useVotingPower } from "@/lib/voting-power/useVotingPower"
import { Avatar, ConnectKitButton } from "connectkit"

export const MenuAvatar = () => {
  const { votingPower } = useVotingPower()

  return (
    <div className="inline-flex min-w-14">
      <ConnectKitButton.Custom>
        {({ isConnected, show, truncatedAddress, ensName, address }) => {
          return (
            <>
              {isConnected && (
                <button
                  onClick={show}
                  className="flex items-center space-x-1.5 rounded-full bg-secondary pr-2.5 transition-opacity hover:bg-accent"
                >
                  <Avatar
                    address={address}
                    size={26}
                    name={ensName || truncatedAddress}
                  />
                  <span className="min-w-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {votingPower?.toString()}
                  </span>
                </button>
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
