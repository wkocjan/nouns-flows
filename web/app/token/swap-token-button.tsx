"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTcrToken } from "@/lib/tcr/use-tcr-token"
import { getEthAddress } from "@/lib/utils"
import { Grant } from "@prisma/client"
import { useRef } from "react"
import { base } from "viem/chains"
import { SwapTokenBox } from "./swap-token-box"

interface Props {
  flow: Grant
  defaultTokenAmount: bigint
}

const chainId = base.id

export function SwapTokenButton(props: Props) {
  const { flow, defaultTokenAmount } = props
  const ref = useRef<HTMLButtonElement>(null)

  const token = useTcrToken(getEthAddress(flow.erc20), getEthAddress(flow.tcr), chainId)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" ref={ref}>
          Buy {token.symbol}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-xs">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">
            Buy and sell TCR tokens
          </DialogTitle>
        </DialogHeader>
        <ul className="my-4 space-y-6">
          <li className="flex items-start space-x-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              1
            </span>
            <p>
              Prices fluctuate based on supply and demand according to an S shaped{" "}
              <a
                href="https://github.com/rocketman-21/flow-contracts/blob/main/src/token-issuance/BondingSCurve.sol"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                bonding curve
              </a>
              . View a visualization{" "}
              <a
                href="https://www.desmos.com/calculator/tnhqeskyi3"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                here
              </a>
              .
            </p>
          </li>
        </ul>
        <SwapTokenBox flow={flow} defaultTokenAmount={defaultTokenAmount} />
      </DialogContent>
    </Dialog>
  )
}
