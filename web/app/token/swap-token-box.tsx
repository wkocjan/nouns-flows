"use client"

import { Button } from "@/components/ui/button"
import { useTcrToken } from "@/lib/tcr/use-tcr-token"
import { getEthAddress } from "@/lib/utils"
import { Grant } from "@prisma/client"
import { useState } from "react"
import { base } from "viem/chains"
import { BuyTokenBox } from "./buy-token-box"
import { SellTokenBox } from "./sell-token-box"
import { Address } from "viem"

interface Props {
  flow: Grant
  defaultTokenAmount: bigint
  defaultSwapState?: SwapState
}

type SwapState = "buy" | "sell"

const chainId = base.id

export function SwapTokenBox(props: Props) {
  const { flow, defaultTokenAmount, defaultSwapState = "buy" } = props
  const [swapState, setSwapState] = useState<SwapState>(defaultSwapState)

  const token = useTcrToken(getEthAddress(flow.erc20), getEthAddress(flow.tcr), chainId)

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-start space-x-2">
        <Button
          className="h-7 rounded-full px-5"
          onClick={() => setSwapState("buy")}
          variant={swapState === "buy" ? "default" : "outline"}
        >
          Buy
        </Button>
        <Button
          className="h-7 rounded-full px-5"
          onClick={() => setSwapState("sell")}
          variant={swapState === "sell" ? "default" : "outline"}
        >
          Sell
        </Button>
      </div>
      <div>
        {swapState === "buy" ? (
          <BuyTokenBox
            parentFlowContract={
              flow.isTopLevel ? getEthAddress(flow.recipient) : getEthAddress(flow.parentContract)
            }
            defaultTokenAmount={defaultTokenAmount}
            switchSwapBox={() => setSwapState("sell")}
            defaultToken={flow.erc20 as Address}
            defaultTokenEmitter={flow.tokenEmitter as Address}
          />
        ) : (
          <SellTokenBox
            flow={flow}
            defaultTokenAmount={defaultTokenAmount}
            switchSwapBox={() => setSwapState("buy")}
            defaultToken={flow.erc20 as Address}
            defaultTokenEmitter={flow.tokenEmitter as Address}
          />
        )}
      </div>
    </div>
  )
}
