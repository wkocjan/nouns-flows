"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MAX_VOTING_POWER, NOUNS_TOKEN } from "@/lib/config"
import { openseaNftUrl } from "@/lib/utils"
import { useDelegatedTokens } from "@/lib/voting/delegated-tokens/use-delegated-tokens"
import { useVotingPower } from "@/lib/voting/use-voting-power"
import { Avatar, ConnectKitButton } from "connectkit"
import Image from "next/image"
import { useCallback, useRef } from "react"
import { mainnet } from "viem/chains"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Alert, AlertDescription } from "../ui/alert"
import { ModeToggle } from "./mode-toggle"

export const MenuAvatar = () => {
  const { address } = useAccount()
  const { votingPower } = useVotingPower()
  const closeRef = useRef<HTMLButtonElement>(null)
  const { tokens } = useDelegatedTokens(address)
  const { disconnect } = useDisconnect()
  const { connectors, connect, data } = useConnect()

  const createWallet = useCallback(() => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === "coinbaseWalletSDK",
    )
    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector })
    }
  }, [connectors, connect])

  return (
    <div className="inline-flex">
      <ConnectKitButton.Custom>
        {({ isConnected, show, truncatedAddress, ensName, address }) => {
          return (
            <>
              {isConnected && (
                <Popover>
                  <PopoverTrigger>
                    <div className="flex h-[26px] items-center space-x-1.5 rounded-full bg-secondary pr-2.5 transition-opacity hover:bg-accent">
                      <Avatar address={address} size={26} name={ensName || truncatedAddress} />
                      <span className="min-w-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                        {votingPower?.toString()}
                      </span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-full max-w-[100vw] md:mr-8 md:w-[380px]">
                    {" "}
                    <PopoverClose ref={closeRef} className="hidden" />
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium">{ensName || truncatedAddress}</span>
                      <div className="flex items-center space-x-2.5">
                        <span className="max-sm:hidden">
                          <ModeToggle />
                        </span>
                        <Button onClick={() => disconnect()} size="sm" variant="outline">
                          Logout
                        </Button>
                      </div>
                    </div>
                    {tokens.length > 0 ? (
                      <Voter votingPower={votingPower} tokenIds={tokens.map((token) => token.id)} />
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          You don&apos;t have any delegated Nouns, which means you can&apos;t vote
                          for grant budget allocations.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          You may like to get involved in the following ways:
                        </p>
                        <div className="flex space-x-2.5">
                          <Button asChild size="sm" className="w-full">
                            <a href="/apply">Apply for a grant</a>
                          </Button>
                          <Button asChild size="sm" className="w-full">
                            <a href="/curate">Become a curator</a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              )}
              {!isConnected && (
                <div className="flex items-center space-x-2.5">
                  <Button variant="ghost" onClick={createWallet}>
                    Sign up
                  </Button>
                  <Button variant="outline" onClick={show}>
                    Log in
                  </Button>
                </div>
              )}
            </>
          )
        }}
      </ConnectKitButton.Custom>
    </div>
  )
}

export function Voter(props: { votingPower: bigint; tokenIds: bigint[] }) {
  const { votingPower, tokenIds } = props

  const tokensCount = tokenIds.length

  return (
    <>
      <div className="text-sm text-muted-foreground">
        You can vote with{" "}
        {new Intl.PluralRules("en-US", { type: "cardinal" }).select(tokensCount) === "one"
          ? `${tokensCount} Noun`
          : `${tokensCount} Nouns`}
        .
        <br />
        <br /> Split the flow of money between different flows & projects by voting.
        {votingPower > MAX_VOTING_POWER && (
          <Alert variant="destructive" className="mt-2.5">
            <AlertDescription className="text-xs">
              Voting power is calculated on the mainnet, but we use Base. Due to current
              limitations, voting transactions fail when representing more than 6 nouns. Therefore,
              you will be voting with a maximum of {MAX_VOTING_POWER.toString()} votes.
            </AlertDescription>
          </Alert>
        )}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6">
        {tokenIds.map((tokenId) => (
          <a
            target="_blank"
            key={tokenId}
            className="group flex items-center"
            href={openseaNftUrl(NOUNS_TOKEN, tokenId.toString(), mainnet.id)}
          >
            <Image
              src={`https://noun.pics/${tokenId.toString()}.png`}
              alt={`Noun ${tokenId}`}
              width={64}
              height={64}
              className="size-8 rounded-md object-cover"
            />
            <span className="ml-2.5 text-sm text-muted-foreground transition-colors group-hover:text-primary">
              Noun {tokenId.toString()}
            </span>
          </a>
        ))}
      </div>
    </>
  )
}
