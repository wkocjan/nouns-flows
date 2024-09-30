import { Status } from "@/lib/enums"
import { Grant } from "@prisma/client"

export function canBeExecuted(grant: Grant) {
  const { challengePeriodEndsAt, isDisputed, status } = grant

  if (!isPendingRequest(status)) return false
  if (isDisputed) return false

  return challengePeriodEndsAt <= Date.now() / 1000
}

export function canBeChallenged(grant: Grant) {
  const { challengePeriodEndsAt, isDisputed, status } = grant

  if (!isPendingRequest(status)) return false
  if (isDisputed) return false

  return challengePeriodEndsAt > Date.now() / 1000
}

function isPendingRequest(status: number) {
  return status === Status.ClearingRequested || status === Status.RegistrationRequested
}
