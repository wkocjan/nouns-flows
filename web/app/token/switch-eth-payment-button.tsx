import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { BaseEthLogo } from "./base-eth-logo"
import { CurrencyDisplay } from "./currency-display"
import Image from "next/image"
import { TokenLogo } from "./token-logo"
import Caret from "@/public/caret-down.svg"

export const SwitchEthChainButton = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CurrencyDisplay className="cursor-pointer py-0.5">
          <BaseEthLogo />
          <span className="pr-1">ETH</span>
          <Image
            src={Caret}
            alt="Caret"
            className="mt-0.5 h-2 w-auto pr-1 text-black dark:text-white"
          />
        </CurrencyDisplay>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <TokenLogo src="/eth.png" alt="ETH" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
