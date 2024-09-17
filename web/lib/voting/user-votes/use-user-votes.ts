import useSWR from "swr"
import { getTokenVotes } from "./get-token-votes"
import { useDelegatedTokens } from "../delegated-tokens/use-delegated-tokens"

export function useUserVotes(contract: `0x${string}`, address: string | undefined) {
  const { tokens } = useDelegatedTokens(address)

  const tokenIds = tokens.map(({ id }) => id.toString())

  const { data, ...rest } = useSWR(
    tokens.length > 0 ? `${contract}_${JSON.stringify(tokenIds)}` : null,
    () => getTokenVotes(contract, tokenIds),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  )

  return {
    votes: data || [],
    ...rest,
  }
}
