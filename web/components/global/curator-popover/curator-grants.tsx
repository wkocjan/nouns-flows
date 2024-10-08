"use client"

import { ActiveCuratorGrant } from "./hooks/get-user-tcr-tokens"
import { ActiveCuratorGrantRow } from "./curator-grant-row"

interface ActiveCuratorGrantsProps {
  grants: ActiveCuratorGrant[]
  closePopover: () => void
}

export function CuratorGrants(props: ActiveCuratorGrantsProps) {
  const { grants: rawGrants, closePopover } = props

  const grants = rawGrants.sort((a, b) => b.challengePeriodEndsAt - a.challengePeriodEndsAt)

  if (grants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-gray-200/30 py-6 text-sm text-muted-foreground dark:bg-gray-800">
        <p>No pending grants. Keep up the great work!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {grants.map((grant) => (
        <ActiveCuratorGrantRow closePopover={closePopover} key={grant.title} grant={grant} />
      ))}
    </div>
  )
}
