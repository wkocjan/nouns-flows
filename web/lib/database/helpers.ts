import { Grant } from "@prisma/flows"
import { Status } from "../enums"

export function isGrantApproved(grant: Grant) {
  const { status } = grant
  return status === Status.Registered || status === Status.ClearingRequested
}

export function isGrantChallenged(grant: Grant) {
  const { status, isDisputed, isResolved } = grant

  if (status === Status.ClearingRequested) return true
  return status === Status.RegistrationRequested && isDisputed === 1 && isResolved === 0
}

export function isGrantAwaiting(grant: Grant) {
  return grant.status === Status.RegistrationRequested
}
