import useSWR from "swr"
import { getDisputes } from "./get-disputes"

export function useDisputes(grantId: string, skip?: boolean) {
  const { data, ...rest } = useSWR(skip ? undefined : `disputes_${grantId}`, () =>
    getDisputes(grantId),
  )

  return {
    dispute: data?.[0] || null,
    disputes: data || [],
    ...rest,
  }
}
