import { GrantsStories } from "@/app/flow/[flowId]/components/grants-stories"
import { AnimatedSalary } from "@/components/global/animated-salary"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Icon } from "@/components/ui/icon"
import { VideoPlayer } from "@/components/ui/video-player"
import { UserProfile } from "@/components/user-profile/user-profile"
import database, { getCacheStrategy } from "@/lib/database/edge"
import { getPool } from "@/lib/database/queries/pool"
import { cn, getEthAddress, getIpfsUrl } from "@/lib/utils"
import { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import pluralize from "pluralize"
import { CSSProperties } from "react"
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
    ...getCacheStrategy(600),
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
  })

  const votes = await database.vote.groupBy({
    by: ["voter"],
    where: { contract: grant.parentContract, recipientId: grant.id, isStale: 0 },
    _count: { tokenId: true },
  })

  const pageData = JSON.parse(grant.derivedData?.pageData ?? "null") as GrantPageData
  const data = pageData || (await generateAndStoreGrantPageData(grant.id))

  if (!data || Object.keys(data).length === 0) notFound()

  const { id, votesCount, isFlow } = grant

  const {
    why,
    focus,
    who,
    how,
    metrics,
    builder,
    cards,
    coverImage,
    media,
    plan,
    timeline,
    tagline,
    title,
  } = data

  return (
    <div className="container mt-2.5 pb-24 md:mt-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Flows</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink href={`/flow/${isFlow ? id : flow.id}`}>
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
        <div className="col-span-7">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={getIpfsUrl(coverImage.url, "pinata")}
              alt={coverImage.alt}
              fill
              className={cn("object-cover", {
                "object-top": coverImage.position === "top",
                "object-center": coverImage.position === "center",
                "object-bottom": coverImage.position === "bottom",
              })}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 p-6">
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              <p className="mt-2 text-lg text-white/80">{tagline}</p>
            </div>
          </div>
        </div>

        <div className="col-span-5 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <div
              style={getGradientVariables(how.gradient)}
              className="h-3/5 rounded-xl bg-gradient-to-br from-[var(--gradient-start-light)] to-[var(--gradient-end-light)] dark:from-[var(--gradient-start-dark)] dark:to-[var(--gradient-end-dark)]"
            >
              <div className="flex h-full flex-col items-start justify-between p-6 text-[var(--text-light)] dark:text-[var(--text-dark)]">
                <Icon name={how.icon} className="size-6" />
                <p className="mt-2 text-sm leading-normal">{how.text}</p>
              </div>
            </div>

            <div
              style={getGradientVariables(who.gradient)}
              className="h-2/5 rounded-xl bg-gradient-to-br from-[var(--gradient-start-light)] to-[var(--gradient-end-light)] p-6 dark:from-[var(--gradient-start-dark)] dark:to-[var(--gradient-end-dark)]"
            >
              <div className="flex flex-col items-start">
                <UserProfile address={getEthAddress(grant.recipient)} withPopover={false}>
                  {(profile) => (
                    <Avatar className="size-8">
                      <AvatarImage src={profile.pfp_url} />
                    </Avatar>
                  )}
                </UserProfile>
                <div className="mt-3 text-sm leading-normal">{who.text}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div
              style={getGradientVariables(focus.gradient)}
              className="relative h-2/5 rounded-xl bg-gradient-to-br from-[var(--gradient-start-light)] to-[var(--gradient-end-light)] p-6 dark:from-[var(--gradient-start-dark)] dark:to-[var(--gradient-end-dark)]"
            >
              <div className="flex h-full flex-col justify-between text-[var(--text-light)] dark:text-[var(--text-dark)]">
                <div className="text-[11px] uppercase tracking-wider opacity-50">Current Focus</div>
                <p className="mt-2 text-sm leading-normal">{focus.text}</p>
              </div>
            </div>

            <div className="relative h-3/5 overflow-hidden rounded-xl">
              <Image
                src={getIpfsUrl(why.image, "pinata")}
                alt=""
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent dark:from-background/80" />
              <div className="relative z-10 flex h-full flex-col justify-end p-5">
                <p className="text-lg font-semibold leading-snug text-white">{why.text}</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="col-span-full grid gap-3"
          style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}
        >
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border bg-card p-6">
              <div className="text-5xl font-bold">{metric.value}</div>
              <div className="mt-2 text-sm">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="col-span-4 row-span-2">
          <div className="h-full rounded-xl border bg-secondary p-6 text-secondary-foreground">
            <UserProfile address={getEthAddress(grant.recipient)} withPopover={false}>
              {(profile) => (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12">
                      <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                      <AvatarFallback>{profile.display_name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-semibold">{profile.display_name}</h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {builder.tags.map((tag) => (
                      <Badge variant="outline" className="py-1 capitalize" key={tag}>
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-4 whitespace-pre-line text-sm leading-relaxed text-secondary-foreground/70">
                    {builder.bio}
                  </div>

                  <div className="flex gap-3">
                    {builder.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        className="rounded-full bg-primary p-2 text-primary-foreground transition-opacity hover:opacity-75"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon name={link.icon} className="size-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </UserProfile>
          </div>
        </div>

        {cards.map((card) => (
          <div key={card.title} className="col-span-4 rounded-xl border bg-card p-6">
            <div className="flex flex-col items-start gap-4">
              <Icon name={card.icon} className="size-9 text-primary" />
              <h3 className="font-bold tracking-tight">{card.title}</h3>
              <p className="leading-relaxed opacity-60">{card.description}</p>
            </div>
          </div>
        ))}

        {media.length > 3 && (
          <div
            className="col-span-full grid gap-3"
            style={{ gridTemplateColumns: `repeat(${media.length}, minmax(0, 1fr))` }}
          >
            {media.map(({ url, alt }) => {
              const isVideo = url.endsWith("m3u8")

              return (
                <div className="relative aspect-square overflow-hidden rounded-xl" key={url}>
                  {isVideo ? (
                    <VideoPlayer
                      url={url}
                      controls
                      className="overflow-hidden rounded-lg object-cover"
                      width="100%"
                      height="100%"
                    />
                  ) : (
                    <Image
                      src={getIpfsUrl(url, "pinata")}
                      alt={alt}
                      fill
                      className="rounded-lg object-cover"
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="relative mt-6 grid grid-cols-12 gap-4">
        <div className="alg:bottom-[-12rem] pointer-events-none absolute left-12 top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-3xl lg:top-auto lg:translate-y-0 lg:transform-gpu">
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-br from-primary to-secondary opacity-30 dark:opacity-25"
          />
        </div>

        <div className="col-span-4 rounded-xl border bg-white/50 p-6 dark:bg-transparent">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="font-medium">Timeline</h3>
            </div>

            <div className="relative space-y-6 pl-6">
              <div className="absolute left-[11px] top-[30px] h-[calc(100%-40px)] w-px bg-border" />
              {timeline.map((item) => (
                <div key={`${item.date}-${item.title}`} className="relative">
                  <div className="absolute -left-6 top-1 size-2.5 rounded-full bg-primary"></div>
                  <div className="text-xs text-muted-foreground">{item.date}</div>
                  <p className="mt-2 text-sm font-medium">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col space-y-4">
          <div className="space-y-6 rounded-xl border bg-white/50 p-6 dark:bg-transparent">
            <div>
              <div className="text-4xl font-bold">
                <AnimatedSalary
                  value={grant.totalEarned}
                  monthlyRate={grant.monthlyIncomingFlowRate}
                />
              </div>
              <div className="mt-1 text-sm text-zinc-400">Total Earned</div>
            </div>

            <div>
              <div className="text-4xl font-bold">{votesCount}</div>
              <div className="mt-1 text-sm text-zinc-400">Community Votes</div>
            </div>
          </div>

          {votes.length > 0 && (
            <div className="grow rounded-xl border bg-white/50 p-6 dark:bg-transparent">
              <h3 className="col-span-full text-lg font-medium">Voters</h3>
              <div className="mt-8 grid grid-cols-3 gap-x-4 gap-y-4">
                {votes.map((voter) => (
                  <UserProfile
                    key={voter.voter}
                    address={getEthAddress(voter.voter)}
                    withPopover={false}
                  >
                    {(profile) => (
                      <div className="flex flex-col items-center">
                        <Avatar className="size-12 bg-primary">
                          <AvatarImage src={profile.pfp_url} />
                        </Avatar>
                        <div className="mt-1.5 text-xs font-medium">{profile.display_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {voter._count.tokenId} {pluralize("vote", voter._count.tokenId)}
                        </div>
                      </div>
                    )}
                  </UserProfile>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-4 bg-white/50 dark:bg-transparent">
          <CurationCard grant={grant} flow={flow} dispute={grant.disputes?.[0]} />
        </div>

        <div className="col-span-full mt-8">
          <h3 className="text-2xl font-medium">The plan</h3>
        </div>

        {plan.map((item) => (
          <div
            key={item.title}
            className="col-span-4 flex gap-x-4 rounded-xl border bg-white/50 p-8 dark:bg-black/5"
          >
            <div className="text-base">
              <h3 className="font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="col-span-full mt-8">
        <h3 className="text-2xl font-medium">Stories</h3>
        <GrantsStories flowId={flow.id} />
      </div>
    </div>
  )
}

function getGradientVariables(gradient: GrantPageData["focus"]["gradient"]) {
  const { light, dark } = gradient
  return {
    "--gradient-start-light": light.gradientStart,
    "--gradient-end-light": light.gradientEnd,
    "--gradient-start-dark": dark.gradientStart,
    "--gradient-end-dark": dark.gradientEnd,
    "--text-light": light.text,
    "--text-dark": dark.text,
  } as CSSProperties
}
