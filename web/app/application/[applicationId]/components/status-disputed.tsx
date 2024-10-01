import { DateTime } from "@/components/ui/date-time"
import { UserProfile } from "@/components/user-profile/user-profile"
import {
  canDisputeBeExecuted,
  canDisputeBeVotedOn,
  isDisputeWaitingForVoting,
} from "@/lib/database/helpers/application"
import { getEthAddress } from "@/lib/utils"
import { Dispute, Grant } from "@prisma/client"
import { ApplicationExecuteDisputeButton } from "./dispute-execute"
import { VotesTicker } from "./votes-ticker"

interface Props {
  grant: Grant
  dispute: Dispute
  flow: Grant
}

export function StatusDisputed(props: Props) {
  const { dispute, flow } = props

  const currentTime = Date.now() / 1000

  if (isDisputeWaitingForVoting(dispute)) {
    return (
      <div className="space-y-4 text-sm">
        <Challenger />
        <VotingStartDate />
        <li>Token holders vote whether to approve or reject it.</li>
      </div>
    )
  }

  if (canDisputeBeVotedOn(dispute)) {
    return (
      <div className="space-y-4 text-sm">
        <Challenger />
        <VotingStartDate />
        <VotingEndDate />
        <RevealDate />
      </div>
    )
  }

  if (canDisputeBeExecuted(dispute)) {
    return (
      <div className="space-y-4 text-sm">
        <Challenger />
        <VotingEndDate />
        <RevealDate />
        <Results />
        <ApplicationExecuteDisputeButton flow={flow} dispute={dispute} className="!mt-6 w-full" />
      </div>
    )
  }

  if (dispute.isExecuted) {
    return (
      <div className="space-y-4 text-sm">
        <Challenger />
        <VotingEndDate />
        <RevealDate />
        <Results />
      </div>
    )
  }

  function Challenger() {
    return (
      <li>
        <span>Application challenged by </span>
        <UserProfile address={getEthAddress(dispute.challenger)}>
          {(profile) => <span className="font-medium">{profile.display_name}</span>}
        </UserProfile>
      </li>
    )
  }

  function VotingStartDate() {
    return (
      <li>
        Voting {currentTime < dispute.votingStartTime ? "starts" : "started"}{" "}
        <DateTime
          date={new Date(dispute.votingStartTime * 1000)}
          relative
          className="font-medium"
        />
      </li>
    )
  }

  function VotingEndDate() {
    return (
      <li>
        Voting {currentTime < dispute.votingEndTime ? "will end" : "ended"}{" "}
        <DateTime date={new Date(dispute.votingEndTime * 1000)} relative className="font-medium" />
      </li>
    )
  }

  function RevealDate() {
    return (
      <li>
        Votes reveal period {currentTime < dispute.revealPeriodEndTime ? "will end" : "ended"}{" "}
        <DateTime
          date={new Date(dispute.revealPeriodEndTime * 1000)}
          relative
          className="font-medium"
        />
      </li>
    )
  }

  function Results() {
    const isPending = dispute.ruling === 0
    const isApproved = dispute.ruling === 1
    const requesterWon = dispute.challengerPartyVotes < dispute.requesterPartyVotes
    return (
      <>
        <li>
          {dispute.votes} votes cast
          <span className="ml-1.5 text-xs text-muted-foreground">
            ({((100 * Number(dispute.votes)) / Number(dispute.totalSupply)).toFixed(2)}% of{" "}
            {dispute.totalSupply} total supply)
          </span>
        </li>
        {!isPending ? (
          <li>
            Request has been{" "}
            <span className={isApproved ? "text-green-500" : "text-red-500"}>
              {isApproved ? "approved" : "rejected"}
            </span>
          </li>
        ) : (
          <li>
            Pending{" "}
            <span className={requesterWon ? "text-green-500" : "text-red-500"}>
              {requesterWon ? "approval" : "rejection"}
            </span>{" "}
            to be executed
          </li>
        )}
        {Number(dispute.votes) > 0 && <VotesTicker dispute={dispute} className="!mt-6" />}
      </>
    )
  }

  return null
}
