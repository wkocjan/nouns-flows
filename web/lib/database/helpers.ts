import { Grant, Story } from "@prisma/flows/edge"
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

const rocketman = "0x289715ffbb2f4b482e2917d2f183feab564ec84f"
const woj = "0x6cc34d9fb4ae289256fc1896308d387aee2bcc52"

export function canEditStory(story: Story, user: string | undefined) {
  return (
    user &&
    (story.participants.includes(user) ||
      story.author === user ||
      user === rocketman ||
      user === woj)
  )
}
