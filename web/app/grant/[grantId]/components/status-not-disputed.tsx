import { DisputeStartButton } from "@/app/components/dispute/dispute-start"
import { canRequestBeExecuted } from "@/app/components/dispute/helpers"
import { RequestExecuteButton } from "@/app/components/dispute/request-execute"
import { DateTime } from "@/components/ui/date-time"
import { Status } from "@/lib/enums"
import { Grant } from "@prisma/client"
import { GrantRemoveRequestButton } from "./remove-request-button"

interface Props {
  grant: Grant
  flow: Grant
}

export const StatusNotDisputed = (props: Props) => {
  const { grant, flow } = props

  if (canRequestBeExecuted(grant)) {
    return (
      <div className="space-y-4 text-sm">
        <li>
          The removal request has been <span className="font-medium text-green-500">approved</span>
        </li>
        <li>No one decided to challenge it.</li>
        <li>Execute the request to finalize the process and remove the grant.</li>
        <RequestExecuteButton grant={grant} flow={flow} className="!mt-6 w-full" />
      </div>
    )
  }

  if (grant.status === Status.ClearingRequested) {
    return (
      <div className="space-y-4 text-sm">
        <li>
          It is marked for removal, unless someone challenges it and starts the voting process.
        </li>
        <li>
          If no challenges are submitted <b>with</b>
          <DateTime
            date={new Date(grant.challengePeriodEndsAt * 1000)}
            className="font-medium"
            relative
          />
          {", "}
          the grant is automatically removed.
        </li>

        <li>Todo: Description here</li>
        <DisputeStartButton grant={grant} flow={flow} className="!mt-6 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4 text-sm">
      <li>
        Grant has been created <DateTime date={new Date(grant.createdAt * 1000)} relative />
      </li>
      <li>Todo: Description here</li>

      {grant.status === Status.Registered && (
        <div className="mt-6">
          <GrantRemoveRequestButton grant={grant} flow={flow} />
        </div>
      )}
    </div>
  )
}
