"use client"

import { Avatar, ConnectKitButton } from "connectkit"
import { Button } from "@/components/ui/button"

export const ConnectWalletButton = () => {
  return (
    <div className="inline-flex min-w-7">
      <ConnectKitButton.Custom>
        {({ isConnected, show, truncatedAddress, ensName, address }) => {
          return (
            <>
              {isConnected && (
                <button onClick={show}>
                  <Avatar
                    address={address}
                    size={28}
                    name={ensName || truncatedAddress}
                  />
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
