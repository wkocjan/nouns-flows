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
import Link from "next/link"
import { useRef } from "react"
import { SwapTokenBox } from "./swap-token-box"

interface Props {
  flow: Grant
  defaultTokenAmount?: bigint
  extraInfo?: "curator" | "apply" | "challenge"
  onSuccess?: (hash: string) => void
  size?: ButtonProps["size"]
  variant?: ButtonProps["variant"]
  text?: string
}

export function SwapTokenButton(props: Props) {
  const {
    flow,
    defaultTokenAmount = BigInt(1e18),
    size = "default",
    text = "Swap",
    variant = "default",
    extraInfo,
    onSuccess = () => {},
  } = props
  const ref = useRef<HTMLButtonElement>(null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} type="button" ref={ref}>
          {text}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-xs">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">
            Buy and sell TCR tokens
          </DialogTitle>
        </DialogHeader>
        <ul className="my-4 space-y-6">
          {extraInfo && (
            <li className="flex items-start space-x-4">
              <>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                  1
                </span>
                {extraInfo === "curator" && (
                  <p>
                    Buy TCR tokens to{" "}
                    <Link
                      href="/curate"
                      className="text-primary underline transition-colors hover:text-primary/80"
                    >
                      become a curator
                    </Link>{" "}
                    and earn a stream of USDC for verifying impact of grantees.
                  </p>
                )}
                {extraInfo === "apply" && (
                  <p>
                    Buy {Number(defaultTokenAmount) / 1e18} TCR tokens to pay your application fee.
                    If your grant is approved, you will get your application fee back.
                  </p>
                )}
                {extraInfo === "challenge" && (
                  <p>
                    Buy {Number(defaultTokenAmount) / 1e18} TCR tokens to challenge a grant. If your
                    challenge is successful, you will win the applicant&apos;s bond and be repaid
                    your challenge fee.
                  </p>
                )}
              </>
            </li>
          )}
          <li className="flex items-start space-x-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              {!extraInfo ? "1" : "2"}
            </span>
            <p>
              Prices change based on supply and demand according to an S shaped{" "}
              <a
                href="https://github.com/rocketman-21/flow-contracts/blob/main/src/token-issuance/BondingSCurve.sol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline transition-colors hover:text-primary/80"
              >
                bonding curve
              </a>
              . View a visualization{" "}
              <a
                href="https://www.desmos.com/calculator/tnhqeskyi3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline transition-colors hover:text-primary/80"
              >
                here
              </a>
              .
            </p>
          </li>
        </ul>
        <SwapTokenBox onSuccess={onSuccess} flow={flow} defaultTokenAmount={defaultTokenAmount} />
      </DialogContent>
    </Dialog>
  )
}
