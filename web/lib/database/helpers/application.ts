import { Status } from "@/lib/enums"
import { Dispute, Grant } from "@prisma/client"

export function canRequestBeExecuted(grant: Grant) {
  const { challengePeriodEndsAt, isDisputed, status } = grant

  if (!isPendingRequest(status)) return false
  if (isDisputed) return false

  return challengePeriodEndsAt <= Date.now() / 1000
}

export function canDisputeBeExecuted(dispute: Dispute) {
  const { appealPeriodEndTime, isExecuted } = dispute

  if (isExecuted) return false

  return appealPeriodEndTime <= Date.now() / 1000
}

export function canDisputeBeVotedOn(dispute: Dispute) {
  const { appealPeriodEndTime, isExecuted } = dispute

  if (isExecuted) return false

  return appealPeriodEndTime >= Date.now() / 1000
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
