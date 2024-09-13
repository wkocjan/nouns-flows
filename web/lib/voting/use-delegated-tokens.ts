import useSWR from "swr"
import { fetchDelegatedTokens } from "./get-delegated-tokens"

export function useDelegatedTokens(address: string | undefined) {
  const { data, error } = useSWR(
    address,
    (address) => fetchDelegatedTokens(address.toLowerCase()),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  // TEMP - WOJCIECH.ETH
  if (address === "0x6cc34d9fb4ae289256fc1896308d387aee2bcc52") {
    return { tokenIds: [BigInt(1)] }
  }

  // TEMP - ROCKETMAN21.ETH
  if (address === "0x289715ffbb2f4b482e2917d2f183feab564ec84f") {
    return { tokenIds: [BigInt(0), BigInt(2)] }
  }

  return {
    tokenIds: data?.map((t) => BigInt(t)) || [],
    isLoading: !error && !data,
    isError: error,
  }
}
