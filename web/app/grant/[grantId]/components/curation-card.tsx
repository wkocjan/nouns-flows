import { StatusDisputed } from "@/app/application/[applicationId]/components/status-disputed"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Status } from "@/lib/enums"
import { Dispute, Grant } from "@prisma/client"
import { StatusNotDisputed } from "./status-not-disputed"

interface Props {
  grant: Grant
  flow: Grant
  disputes: Dispute[]
}

export const CurationCard = (props: Props) => {
  const { grant, flow, disputes } = props
  const { isDisputed, status } = grant
  const dispute = disputes.find((d) => !d.isExecuted)

  return (
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
  )
}
