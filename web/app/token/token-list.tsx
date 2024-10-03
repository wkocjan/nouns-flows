import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import { TokenLogo } from "./token-logo"
import { useAccount } from "wagmi"
import { Address, formatEther } from "viem"
import { useTcrTokenBalance } from "@/lib/tcr/use-tcr-token-balance"
import { formatUSDValue, useETHPrice } from "./hooks/useETHPrice"
import { useSellTokenQuote } from "./hooks/useSellTokenQuote"
import { base } from "viem/chains"

const chainId = base.id

interface TokenData {
  address: string | undefined
  name: string | undefined
  symbol: string | undefined
  image: string | undefined
  tagline: string | undefined
  tokenEmitter: string | undefined
}

interface TokenListProps {
  tokens: TokenData[] | undefined
}

export const TokenList = ({ tokens }: TokenListProps) => {
  const { address: owner } = useAccount()
  const { balances } = useTcrTokenBalance(
    tokens?.map((token) => getEthAddress(token.address as Address)) || [],
    owner,
  )
  const { ethPrice } = useETHPrice()

  return (
    <ul>
      {tokens?.map((token, index) => (
        <TokenListItem
          key={token.address}
          token={token}
          balance={balances[index]}
          ethPrice={ethPrice || 0}
        />
      ))}
    </ul>
  )
}

const TokenListItem = ({
  token,
  balance,
  ethPrice,
}: {
  token: TokenData
  balance: bigint
  ethPrice: number
}) => {
  const {
    payment,
    isLoading: isLoadingQuote,
    isError,
  } = useSellTokenQuote(getEthAddress(token.tokenEmitter || ""), balance, chainId)

  return (
    <li>
      <div className="flex cursor-pointer flex-row items-center justify-between rounded-md px-3 py-4 hover:bg-gray-200">
        <div className="flex items-center gap-3">
          <TokenLogo height={45} width={45} src={getIpfsUrl(token.image || "")} alt="TCR token" />
          <div className="flex flex-col items-start justify-between">
            <span className="text-xl">{token.name}</span>
            <span className="text-sm opacity-50">{token.symbol}</span>
          </div>
        </div>
        {balance && (
          <div className="flex flex-col items-end justify-between">
            <span className="text-xl">{formatUSDValue(ethPrice || 0, payment)}</span>
            <span className="text-sm opacity-50">{formatEther(balance)}</span>
          </div>
        )}
      </div>
    </li>
  )
}
