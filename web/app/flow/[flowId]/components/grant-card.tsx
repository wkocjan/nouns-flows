import { MonthlyBudget } from "@/app/components/monthly-budget"
import { AnimatedSalary } from "@/components/global/animated-salary"
import { getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/client"
import Image from "next/image"

interface Props {
  grant: Grant
}

export function GrantCard({ grant }: Props) {
  return (
    <article className="group relative isolate flex flex-col justify-between overflow-hidden rounded-2xl bg-primary p-5">
      <Image
        alt=""
        src={getIpfsUrl(grant.image)}
        className="absolute inset-0 -z-10 size-full object-cover transition-transform group-hover:scale-110"
        width={256}
        height={256}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
      <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-secondary" />

      <div className="flex justify-between text-sm">
        <AnimatedSalary value={grant.totalEarned} monthlyRate={grant.monthlyIncomingFlowRate} />
        <MonthlyBudget display={grant.monthlyIncomingFlowRate} flow={grant} />
      </div>

      <div>
        <h3 className="mt-48 text-balance text-base font-medium text-white">
          <a href={`/item/${grant.id}`}>
            <span className="absolute inset-0" />
            {grant.title}
          </a>
        </h3>
        {/* <div className="mt-1 line-clamp-1 text-xs text-gray-300">{grant.tagline}</div> */}
      </div>
    </article>
  )
}
