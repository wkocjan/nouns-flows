"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CurrencyDisplay } from "./currency-display"
import { TokenLogo } from "./token-logo"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import { base } from "viem/chains"
import { useERC20TokensForParent } from "@/lib/tcr/use-erc20-tokens"
import { Grant } from "@prisma/client"
import Image from "next/image"
import Caret from "@/public/caret-down.svg"
import { SkeletonLoader } from "@/components/ui/skeleton"
import { TokenList } from "./token-list"

interface Props {
  flow: Grant
}

const chainId = base.id

export function TokenSwitcherDialog({ flow }: Props) {
  const { tokens, isLoading } = useERC20TokensForParent(
    flow.isTopLevel ? getEthAddress(flow.recipient) : getEthAddress(flow.parentContract),
    chainId,
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex flex-shrink-0">
          <CurrencyDisplay>
            <TokenLogo src={getIpfsUrl(flow.image)} alt="TCR token" />
            <span className="px-1">
              {tokens?.find((token) => token.address === flow.erc20)?.symbol}
            </span>
            <Image
              src={Caret}
              alt="Caret"
              className="mt-0.5 h-2 w-auto pr-1 text-black dark:text-white"
            />
          </CurrencyDisplay>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-xs">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">Select a token</DialogTitle>
        </DialogHeader>
        {isLoading ? <SkeletonLoader height={82} count={4} /> : <TokenList tokens={tokens} />}
      </DialogContent>
    </Dialog>
  )
}
