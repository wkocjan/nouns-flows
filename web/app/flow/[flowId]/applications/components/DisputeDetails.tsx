import { DateTime } from "@/components/ui/date-time"
import { Dispute } from "@prisma/client"

interface Props {
  dispute: Dispute
}

export function DisputeDetails(props: Props) {
  const { dispute } = props

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="mb-1 text-sm text-muted-foreground">Voting Start</h3>
        <DateTime date={new Date(dispute.votingStartTime * 1000)} relative className="text-base" />
      </div>
      <div>
        <h3 className="mb-1 text-sm text-muted-foreground">Voting End</h3>
        <DateTime date={new Date(dispute.votingEndTime * 1000)} relative className="text-base" />
      </div>
      <div>
        <h3 className="mb-1 text-sm text-muted-foreground">Reveal Period Ends</h3>
        <DateTime
          date={new Date(dispute.revealPeriodEndTime * 1000)}
          relative
          className="text-base"
        />
      </div>
      <div>
        <h3 className="mb-1 text-sm text-muted-foreground">Final Ruling</h3>
        <p className="text-base">{dispute.ruling}</p>
      </div>
      <div>
        <h3 className="mb-1 text-sm text-muted-foreground">Total Revealed Votes</h3>
        <p className="text-base">{Number(dispute.votes) / 1e18}</p>
      </div>
    </div>
  )
}
