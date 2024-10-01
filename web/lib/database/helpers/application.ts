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
  const { appealPeriodEndTime, isExecuted, votingStartTime } = dispute

  if (isExecuted) return false

  return votingStartTime <= Date.now() / 1000 && appealPeriodEndTime >= Date.now() / 1000
}

export function isDisputeResolvedForNoneParty(dispute: Dispute) {
  const { isExecuted, ruling } = dispute

  if (!isExecuted) return false

  return ruling === 0
}

export function isDisputeWaitingForVoting(dispute: Dispute) {
  const { isExecuted, votingStartTime } = dispute

  if (isExecuted) return false

  return votingStartTime > Date.now() / 1000
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
