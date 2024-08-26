import { Badge } from "@/components/ui/badge"
import { Grant } from "@/lib/data/grants"

type Props = Pick<Grant, "isApproved" | "isChallenged">

export const GrantBadge = (props: Props) => {
  return <Badge>Test</Badge>
}
