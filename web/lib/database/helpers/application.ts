import { Status } from "@/lib/enums"
import { Party } from "@/lib/kv/disputeVote"
import { Dispute, Grant } from "@prisma/client"

export function canRequestBeExecuted(
  grant: Pick<Grant, "challengePeriodEndsAt" | "isDisputed" | "status">,
) {
  const { challengePeriodEndsAt, isDisputed, status } = grant

  if (!isPendingRequest(status)) return false
  if (isDisputed) return false

  return challengePeriodEndsAt <= Date.now() / 1000
}

export function canDisputeBeExecuted(
  dispute?: Pick<Dispute, "revealPeriodEndTime" | "isExecuted">,
) {
  if (!dispute) return false
  const { revealPeriodEndTime, isExecuted } = dispute

  if (isExecuted) return false

  return revealPeriodEndTime <= Date.now() / 1000
}

export function canDisputeBeVotedOn(
  dispute: Pick<Dispute, "votingEndTime" | "isExecuted" | "votingStartTime">,
) {
  const { votingEndTime, isExecuted, votingStartTime } = dispute

  const isAfterVotingStartTime = votingStartTime <= Date.now() / 1000
  const isBeforeVotingEndTime = votingEndTime >= Date.now() / 1000

  if (isExecuted) return false

  return isAfterVotingStartTime && isBeforeVotingEndTime
}

export function isDisputeRevealingVotes(
  dispute: Pick<Dispute, "votingEndTime" | "revealPeriodEndTime">,
) {
  const { votingEndTime, revealPeriodEndTime } = dispute

  return votingEndTime <= Date.now() / 1000 && revealPeriodEndTime >= Date.now() / 1000
}

export function isDisputeResolvedForNoneParty(dispute?: Dispute) {
  if (!dispute) return false
  const { isExecuted, ruling } = dispute

  if (!isExecuted) return false

  return ruling === 0
}

export function isRequestRejected(grant: Grant, dispute?: Dispute) {
  if (!dispute) return false
  const { isDisputed, isResolved } = grant
  const { isExecuted, ruling } = dispute

  if (!isExecuted) return false
  if (ruling !== Party.Challenger) return false

  return isDisputed === 0 && isResolved === 1
}

export function isDisputeWaitingForVoting(
  dispute: Pick<Dispute, "isExecuted" | "votingStartTime">,
) {
  const { isExecuted, votingStartTime } = dispute

  if (isExecuted) return false

  return votingStartTime > Date.now() / 1000
}

export function isDisputeVotingOver(dispute: Pick<Dispute, "votingEndTime">) {
  const { votingEndTime } = dispute

  return votingEndTime < Date.now() / 1000
}

export function canBeChallenged(
  grant: Pick<Grant, "challengePeriodEndsAt" | "isDisputed" | "status">,
) {
  const { challengePeriodEndsAt, isDisputed, status } = grant

  if (!isPendingRequest(status)) return false
  if (isDisputed) return false

  return challengePeriodEndsAt > Date.now() / 1000
}

function isPendingRequest(status: number) {
  return status === Status.ClearingRequested || status === Status.RegistrationRequested
}
