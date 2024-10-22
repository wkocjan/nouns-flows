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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Currency } from "@/components/ui/currency"
import { Markdown } from "@/components/ui/markdown"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database"
import { getPool } from "@/lib/database/queries/pool"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import { Metadata } from "next"
import Image from "next/image"
import { ClaimableBalance } from "./components/claimable-balance"
import { CurationCard } from "./components/curation-card"
import { Updates } from "./components/updates"
import { UserVotes } from "./components/user-votes"
import { Voters } from "./components/voters"
import { Comments } from "@/components/comments/comments"

interface Props {
  params: {
    grantId: string
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { grantId } = props.params

  const pool = await getPool()

  const grant = await database.grant.findFirstOrThrow({
    where: { id: grantId, isTopLevel: 0 },
    select: { title: true, tagline: true },
  })

  return { title: `${grant.title} - ${pool.title}`, description: grant.tagline }
}

export default async function GrantPage({ params }: Props) {
  const { grantId } = params

  const grant = await database.grant.findUniqueOrThrow({
    where: { id: grantId, isActive: 1, isTopLevel: 0 },
    include: {
      flow: true,
      disputes: {
        orderBy: { creationBlock: "desc" },
        include: { evidences: true },
        take: 1,
      },
      updates: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 45,
      },
    },
  })

  const { title, tagline, description, flow, image, votesCount, parentContract, isFlow } = grant

  return (
    <div className="container mt-2.5 pb-24 md:mt-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Flows</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          {isFlow === 0 && (
            <BreadcrumbItem>
              <BreadcrumbLink href={`/flow/${flow.id}`}>{flow.title}</BreadcrumbLink>
            </BreadcrumbItem>
          )}

          {isFlow === 1 && (
            <BreadcrumbItem>
              <BreadcrumbLink href={`/flow/${grant.id}`}>{grant.title}</BreadcrumbLink>
            </BreadcrumbItem>
          )}

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{isFlow ? "Flow details" : title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <div className="flex items-center space-x-4">
            <Image
              src={getIpfsUrl(image)}
              alt={title}
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-md object-cover"
            />
            <div>
              <h1 className="text-xl font-bold md:text-3xl">{title}</h1>
              <p className="text-base text-muted-foreground md:text-lg">{tagline}</p>
            </div>
          </div>

          <div className="mb-12 mt-6 space-y-4 text-pretty text-sm md:text-base">
            <Markdown>{description}</Markdown>
          </div>

          {!isFlow && <Updates casts={grant.updates} recipient={grant.recipient} />}
        </div>

        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {!isFlow && (
                  <div>
                    <h4 className="text-[13px] text-muted-foreground">Builders</h4>
                    <div className="mt-1 flex space-x-0.5">
                      <UserProfile address={getEthAddress(grant.recipient)} key={grant.recipient}>
                        {(profile) => (
                          <Avatar className="size-7 bg-accent text-xs">
                            <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                            <AvatarFallback>{profile.display_name[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                        )}
                      </UserProfile>
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Monthly budget</h4>
                  <Badge className="mt-2">
                    <Currency>{grant.monthlyIncomingFlowRate}</Currency>
                    /mo
                  </Badge>
                </div>
                <div>
                  <h4 className="text-[13px] text-muted-foreground">
                    {isFlow ? "Paid out" : "Total Earned"}
                  </h4>
                  <p className="mt-1 text-lg font-medium">
                    <AnimatedSalary
                      value={grant.totalEarned}
                      monthlyRate={grant.monthlyIncomingFlowRate}
                    />
                  </p>
                </div>
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Community Votes</h4>
                  <p className="mt-1 text-lg font-medium">{grant.votesCount}</p>
                </div>
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Your Vote</h4>
                  <p className="mt-1 text-lg font-medium">
                    <UserVotes recipientId={grant.id} contract={getEthAddress(parentContract)} />
                  </p>
                </div>
                <ClaimableBalance
                  flow={getEthAddress(grant.parentContract)}
                  recipient={grant.recipient}
                  pools={[grant.flow.baselinePool, grant.flow.bonusPool].map((pool) =>
                    getEthAddress(pool),
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <CurationCard grant={grant} flow={flow} dispute={grant.disputes?.[0]} />

          {Number(votesCount) > 0 && (
            <Voters contract={getEthAddress(parentContract)} recipientId={grant.id} />
          )}

          {!isFlow && (
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <Comments commentableId={grant.id} maxHeight={450} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
