import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Icon } from "@/components/ui/icon"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { getPool } from "@/lib/database/queries/pool"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Builder } from "./cards/builder"
import { CoverImage } from "./cards/cover-image"
import { FocusCard } from "./cards/focus"
import { HowCard } from "./cards/how"
import { Media } from "./cards/media"
import { Metrics } from "./cards/metrics"
import { Plan } from "./cards/plan"
import { Stats } from "./cards/stats"
import { Timeline } from "./cards/timeline"
import { Voters } from "./cards/voters"
import { WhoCard } from "./cards/who"
import { WhyCard } from "./cards/why"
import { BgGradient } from "./components/bg-gradient"
import { CurationCard } from "./components/curation-card"
import { generateAndStoreGrantPageData } from "./page-data/get"
import { GrantPageData } from "./page-data/schema"

interface Props {
  params: Promise<{ grantId: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { grantId } = await props.params

  const pool = await getPool()

  const grant = await database.grant.findFirstOrThrow({
    where: { id: grantId, isTopLevel: 0 },
    select: { title: true, tagline: true },
    ...getCacheStrategy(1200),
  })

  return { title: `${grant.title} - ${pool.title}`, description: grant.tagline }
}

export default async function GrantPage(props: Props) {
  const { grantId } = await props.params

  const { flow, ...grant } = await database.grant.findUniqueOrThrow({
    where: { id: grantId, isActive: 1, isTopLevel: 0 },
    include: {
      flow: true,
      derivedData: { select: { pageData: true } },
      disputes: { orderBy: { creationBlock: "desc" }, include: { evidences: true }, take: 1 },
    },
    ...getCacheStrategy(600), // ToDo: Invalidate on edit
  })

  const pageData = JSON.parse(grant.derivedData?.pageData ?? "null") as GrantPageData | null
  const data = pageData || (await generateAndStoreGrantPageData(grant.id))

  if (!data || Object.keys(data).length === 0) notFound()

  const { isFlow } = grant

  const { why, focus, who, how, builder, title } = data

  return (
    <div className="container mt-2.5 pb-24 md:mt-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Flows</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/flow/${isFlow ? grant.id : flow.id}`}>
              {isFlow ? title : flow.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{isFlow ? "Flow details" : title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-12 gap-4">
        <CoverImage coverImage={data.coverImage} title={title} tagline={data.tagline} />

        <div className="col-span-5 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <HowCard gradient={how.gradient} icon={how.icon} text={how.text} />
            <WhoCard gradient={who.gradient} text={who.text} recipient={grant.recipient} />
          </div>

          <div className="flex flex-col gap-4">
            <FocusCard gradient={focus.gradient} text={focus.text} />
            <WhyCard image={why.image} text={why.text} />
          </div>
        </div>

        <Metrics metrics={data.metrics} />

        <Builder
          tags={builder.tags}
          bio={builder.bio}
          links={builder.links}
          recipient={grant.recipient as `0x${string}`}
        />

        {data.cards.map((card) => (
          <div key={card.title} className="col-span-4 rounded-xl border bg-card p-6">
            <div className="flex flex-col items-start gap-4">
              <Icon name={card.icon} className="size-9 text-primary" />
              <h3 className="font-bold tracking-tight">{card.title}</h3>
              <p className="leading-relaxed opacity-60">{card.description}</p>
            </div>
          </div>
        ))}

        <Media media={data.media} />
      </div>

      <div className="relative mt-6 grid grid-cols-12 gap-4">
        <BgGradient />

        <div className="col-span-4">
          <Timeline timeline={data.timeline} />
        </div>

        <div className="col-span-4 flex flex-col space-y-4">
          <Stats grant={grant} />

          <Suspense>
            <Voters
              contract={grant.parentContract as `0x${string}`}
              recipientId={grant.id}
              flowVotesCount={flow.votesCount}
            />
          </Suspense>
        </div>

        <div className="col-span-4 bg-white/50 dark:bg-transparent">
          <CurationCard grant={grant} flow={flow} dispute={grant.disputes?.[0]} />
        </div>

        <Plan plan={data.plan} />
      </div>
    </div>
  )
}
