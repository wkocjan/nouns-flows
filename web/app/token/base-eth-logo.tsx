import Image from "next/image"
import { TokenLogo } from "./token-logo"

export const BaseEthLogo = () => (
  <div className="flex items-center">
    <TokenLogo src="/eth.png" alt="ETH" />
    <div className="-ml-2 mt-4 rounded-[6px] bg-white p-[3px] dark:bg-black">
      <Image src="/base.png" alt="Base" className="rounded-[2px]" width={12} height={12} />
    </div>
  </div>
)
