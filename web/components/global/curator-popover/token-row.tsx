import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import { TcrTokenBalance } from "@/components/ui/tcr-token-balance"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/flows/edge"
import Image from "next/image"
import Link from "next/link"
import { formatEther, getAddress } from "viem"
import { WithdrawCuratorSalaryButton } from "../withdraw-curator-salary-button"

interface Props {
  flow: Pick<
    Grant,
    | "id"
    | "title"
    | "image"
    | "superToken"
    | "managerRewardSuperfluidPool"
    | "erc20"
    | "monthlyRewardPoolFlowRate"
    | "activeRecipientCount"
    | "awaitingRecipientCount"
    | "challengedRecipientCount"
  >
  subgrants: Grant[]
  closePopover: () => void
  balance: string
}

export function TokenRow(props: Props) {
  const { flow, closePopover, balance, subgrants } = props

  return (
    <div className="grid grid-cols-5 items-center gap-2 border-t border-border py-2.5">
      <div className="col-span-2 flex items-center space-x-2 overflow-hidden">
        <Image
          src={getIpfsUrl(flow.image)}
          alt={flow.title}
          className="size-6 flex-shrink-0 rounded-full object-cover max-sm:hidden"
          width={24}
          height={24}
        />
        <Link
          href={`/flow/${flow.id}`}
          className="truncate text-sm hover:underline"
          onClick={closePopover}
        >
          {flow.title}
        </Link>
      </div>
      <TcrTokenBalance
        erc20={getAddress(flow.erc20)}
        className="text-center text-sm font-medium"
        balance={formatEther(BigInt(balance))}
        monthlyRewardPoolRate={flow.monthlyRewardPoolFlowRate}
      />

      <GrantStatusCountBadges subgrants={subgrants} id={flow.id} flow={flow} />

      <div className="text-center text-sm font-medium">
        <WithdrawCuratorSalaryButton pool={getEthAddress(flow.managerRewardSuperfluidPool)} />
      </div>
    </div>
  )
}
