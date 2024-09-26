import { ApplicationStatus } from "@/lib/enums"
import { Application } from "@prisma/client"

export function canBeExecuted(application: Application) {
  const { challengePeriodEndsAt, isDisputed, status } = application

  if (!isPendingRequest(status)) return false
  if (isDisputed) return false

  return challengePeriodEndsAt <= Date.now() / 1000
}

export function canBeChallenged(application: Application) {
  const { challengePeriodEndsAt, isDisputed, status } = application

  if (!isPendingRequest(status)) return false
  if (isDisputed) return false

  return challengePeriodEndsAt > Date.now() / 1000
}

function isPendingRequest(status: number) {
  return (
    status === ApplicationStatus.ClearingRequested ||
    status === ApplicationStatus.RegistrationRequested
  )
}
