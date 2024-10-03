import { Address, erc20Abi } from "viem"
import { base } from "viem/chains"
import { useReadContracts } from "wagmi"
import { useFlowsForParent } from "./use-flows-for-parent"

export function useERC20TokensForParent(parentGrantContract: Address, chainId = base.id) {
  const { grants } = useFlowsForParent(parentGrantContract)

  const erc20s = grants.map((grant) => ({
    abi: erc20Abi,
    address: grant.erc20 as Address,
    chainId,
  }))

  const { data, refetch, isLoading } = useReadContracts({
    contracts: erc20s.flatMap((erc20) => [
      { ...erc20, functionName: "symbol" },
      { ...erc20, functionName: "name" },
    ]),
  })

  const tokenData = data?.reduce(
    (acc, token, index) => {
      if (index % 2 === 0) {
        const address = erc20s[index / 2]?.address
        acc.push({
          address,
          symbol: token.result as string,
          image: grants.find((grant) => grant.erc20 === address)?.image,
          name: data[index + 1]?.result as string,
          tagline: grants.find((grant) => grant.erc20 === address)?.tagline ?? undefined,
        })
      }
      return acc
    },
    [] as {
      address: Address | undefined
      symbol: string | undefined
      name: string | undefined
      image: string | undefined
      tagline: string | undefined
    }[],
  )

  return {
    tokens: tokenData,
    refetch,
    isLoading,
  }
}
