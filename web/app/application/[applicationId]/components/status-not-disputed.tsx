import { DateTime } from "@/components/ui/date-time"
import { canRequestBeExecuted } from "@/lib/database/helpers/application"
import { Grant } from "@prisma/client"
import { ApplicationChallengeButton } from "./dispute-start"
import { ApplicationExecuteRequestButton } from "./request-execute"
import { Status } from "@/lib/enums"

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
          The application has been <span className="font-medium text-green-500">approved</span>
        </li>
        <li>No one decided to challenge it.</li>
        <li>Execute the application to finalize the process.</li>
        <ApplicationExecuteRequestButton grant={grant} flow={flow} className="!mt-6 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4 text-sm">
      <li>
        Challenge period ends{" "}
        <DateTime
          date={new Date(grant.challengePeriodEndsAt * 1000)}
          className="font-medium"
          relative
        />
      </li>

      <li>During this period, anyone can challenge the application.</li>

      <li>
        If no challenges are submitted by the end of this period, the application is automatically
        approved.
      </li>

      <ApplicationChallengeButton grant={grant} flow={flow} className="!mt-6 w-full" />
    </div>
  )
}
