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
        <button>
          <CurrencyDisplay>
            <TokenLogo src={getIpfsUrl(flow.image)} alt="TCR token" />
            <span className="px-1">
              {tokens?.find((token) => token.address === flow.erc20)?.symbol}
            </span>
          </CurrencyDisplay>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-xs">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">Select a token</DialogTitle>
        </DialogHeader>
        <TokenList tokens={tokens} />
      </DialogContent>
    </Dialog>
  )
}

interface TokenData {
  address: string | undefined
  name: string | undefined
  symbol: string | undefined
  image: string | undefined
  tagline: string | undefined
}

interface TokenListProps {
  tokens: TokenData[] | undefined
}

const TokenListItem = ({ token }: { token: TokenData }) => (
  <li>
    <div className="cursor-pointer rounded-md p-2 hover:bg-gray-200">
      <div className="flex items-center gap-3">
        <TokenLogo height={45} width={45} src={getIpfsUrl(token.image || "")} alt="TCR token" />
        <div className="flex flex-col items-start justify-between">
          <span className="text-xl">{token.name}</span>
          <span className="text-sm opacity-50">{token.symbol}</span>
        </div>
      </div>
    </div>
  </li>
)

const TokenList = ({ tokens }: TokenListProps) => (
  <ul>{tokens?.map((token) => <TokenListItem key={token.address} token={token} />)}</ul>
)
