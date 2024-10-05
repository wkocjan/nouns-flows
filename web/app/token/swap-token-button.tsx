"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Grant } from "@prisma/client"
import { useRef } from "react"
import { SwapTokenBox } from "./swap-token-box"

interface Props {
  flow: Grant
  defaultTokenAmount?: bigint
  onSuccess?: (hash: string) => void
  size?: ButtonProps["size"]
}

export function SwapTokenButton(props: Props) {
  const { flow, defaultTokenAmount = BigInt(1e18), size = "default" } = props
  const ref = useRef<HTMLButtonElement>(null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={size} type="button" ref={ref}>
          Swap
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
              Prices change based on supply and demand according to an S shaped{" "}
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
        <SwapTokenBox
          onSuccess={props.onSuccess || (() => {})}
          flow={flow}
          defaultTokenAmount={defaultTokenAmount}
        />
      </DialogContent>
    </Dialog>
  )
}
