import useSWR from "swr"
import { getUserVotes } from "./get-user-votes"

export function useUserVotes(contract: `0x${string}`, address: string | undefined) {
  const { data, ...rest } = useSWR(
    address ? `${contract}_${address}` : null,
    () => getUserVotes(contract, address),
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
