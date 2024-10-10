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
import { getIpfsUrl } from "@/lib/utils"
import { base } from "viem/chains"
import { useERC20TokensForParent } from "@/lib/tcr/use-erc20s-for-parent"
import { SkeletonLoader } from "@/components/ui/skeleton"
import { TokenList } from "./token-list"
import { Address } from "viem"
import { useRef } from "react"
import { useFlowForToken } from "@/lib/tcr/use-flow-for-token"
import SvgCaretDown from "@/icons/caret-down"

interface Props {
  switchToken: (token: Address, tokenEmitter: Address) => void
  currentToken: Address | undefined
  currentTokenEmitter: Address | undefined
  parentFlowContract: Address
}

const chainId = base.id

export function TokenSwitcherDialog({
  switchToken,
  currentToken,
  currentTokenEmitter,
  parentFlowContract,
}: Props) {
  const { tokens, isLoading } = useERC20TokensForParent(parentFlowContract, chainId)
  const ref = useRef<HTMLButtonElement>(null)

  const { flow } = useFlowForToken(currentToken)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button ref={ref} className="flex flex-shrink-0">
          <CurrencyDisplay>
            {flow?.image && <TokenLogo src={getIpfsUrl(flow?.image || "")} alt="TCR token" />}
            <span className="px-1">
              {tokens?.find((erc20) => erc20.address === currentToken)?.symbol}
            </span>
            <SvgCaretDown className="mt-0.5 h-2 w-auto pr-1 text-black dark:text-white" />
          </CurrencyDisplay>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">Select a token</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <SkeletonLoader height={82} count={4} />
        ) : (
          <TokenList
            switchToken={(token, tokenEmitter) => {
              switchToken(token, tokenEmitter)
              ref.current?.click() // close dialog
            }}
            currentTokenEmitter={currentTokenEmitter}
            tokens={tokens}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
