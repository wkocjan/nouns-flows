import "server-only"

import { DisputeStartButton } from "@/app/components/dispute/dispute-start"
import { canRequestBeExecuted, formatEvidence } from "@/app/components/dispute/helpers"
import { RequestExecuteButton } from "@/app/components/dispute/request-execute"
import { DateTime } from "@/components/ui/date-time"
import database from "@/lib/database/edge"
import { Status } from "@/lib/enums"
import { Grant } from "@prisma/flows"
import { GrantRemoveRequestButton } from "./remove-request-button"

interface Props {
  grant: Grant
  flow: Grant
}

export const StatusNotDisputed = async (props: Props) => {
  const { grant, flow } = props

  const evidence = await database.evidence.findFirst({
    where: { evidenceGroupID: grant.evidenceGroupID },
  })

  if (canRequestBeExecuted(grant)) {
    return (
      <div className="space-y-4 text-sm">
        <li>
          The {grant.isFlow ? "flow" : "grant"} has been marked for{" "}
          <span className="font-medium text-red-500">removal</span>.
        </li>
        <li>No one decided to challenge the removal request.</li>
        {evidence?.evidence && <li>{formatEvidence(evidence.evidence)}</li>}
        <li>
          Execute the request to finalize the process and remove the{" "}
          {grant.isFlow ? "flow" : "grant"}.
        </li>
        <RequestExecuteButton grant={grant} flow={flow} className="!mt-6 w-full" />
      </div>
    )
  }

  if (grant.status === Status.ClearingRequested) {
    return (
      <div className="space-y-4 text-sm">
        <li>
          This {grant.isFlow ? "flow" : "grant"} will be{" "}
          <span className="font-medium text-red-500">removed</span> - unless someone challenges the
          removal request and starts the voting process.
        </li>
        {evidence?.evidence && <li>{formatEvidence(evidence.evidence)}</li>}
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

        <DisputeStartButton grant={grant} flow={flow} className="!mt-6 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4 text-sm">
      <li>
        Created <DateTime date={new Date(grant.createdAt * 1000)} relative />
      </li>
      <li>
        Curators of the &quot;{flow.title}&quot; flow can request the removal of this{" "}
        {grant.isFlow ? "flow" : "grant"} if they think there is a valid reason to do so.
      </li>

      {grant.status === Status.Registered && (
        <div className="mt-6">
          <GrantRemoveRequestButton grant={grant} flow={flow} />
        </div>
      )}
    </div>
  )
}
