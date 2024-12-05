import { DisputeUserVote } from "@/app/components/dispute/dispute-user-vote"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Status } from "@/lib/enums"
import { Dispute, Evidence, Grant } from "@prisma/flows/edge"
import { StatusDisputed } from "./status-disputed"
import { StatusNotDisputed } from "./status-not-disputed"

interface Props {
  grant: Grant
  flow: Grant
  dispute: Dispute & { evidences: Evidence[] }
}

export const CurationCard = (props: Props) => {
  const { grant, flow, dispute } = props
  const { isDisputed, status } = grant

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Curation
            {status === Status.ClearingRequested && (
              <Badge variant="destructive">Removal Requested</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isDisputed && <StatusNotDisputed grant={grant} flow={flow} />}
          {isDisputed === 1 && dispute && (
            <StatusDisputed grant={grant} flow={flow} dispute={dispute} />
          )}
        </CardContent>
      </Card>
      {dispute && grant.isDisputed === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Your vote</CardTitle>
          </CardHeader>
          <CardContent>
            <DisputeUserVote grant={grant} flow={flow} dispute={dispute} />
          </CardContent>
        </Card>
      )}
    </>
  )
}
