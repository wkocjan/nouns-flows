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
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import { ClaimableBalance } from "./components/claimable-balance"
import { UserVotes } from "./components/user-votes"
import { Voters } from "./components/voters"

interface Props {
  params: {
    grantId: string
  }
}

export default async function GrantPage({ params }: Props) {
  const { grantId } = params

  const grant = await database.grant.findUniqueOrThrow({
    where: { id: grantId },
    include: { parentGrant: true },
  })

  const { title, tagline, description, parentGrant, image, recipientId, parent, votesCount } = grant

  return (
    <div className="container mt-2.5 pb-24 md:mt-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Categories</BreadcrumbLink>
          </BreadcrumbItem>

          {parentGrant && parentGrant.isFlow && (
            <>
              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbLink href={`/flow/${parentGrant.id}`}>
                  {parentGrant?.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-20">
        <div className="md:col-span-3">
          <div className="flex items-center space-x-4">
            <Image
              src={getIpfsUrl(image)}
              alt={title}
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-md"
            />
            <div>
              <h1 className="text-xl font-bold md:text-3xl">{title}</h1>
              <p className="text-base text-muted-foreground md:text-lg">{tagline}</p>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-pretty text-sm md:text-base">
            <Markdown>{description}</Markdown>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
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
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Budget</h4>
                  <Badge className="mt-2">
                    <Currency>{grant.monthlyFlowRate}</Currency>
                    /mo
                  </Badge>
                </div>
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Total Earned</h4>
                  <p className="mt-1 text-lg font-medium">
                    <Currency>{grant.totalEarned}</Currency>
                  </p>
                </div>
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Total Votes</h4>
                  <p className="mt-1 text-lg font-medium">{grant.votesCount}</p>
                </div>
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Your Vote</h4>
                  <p className="mt-1 text-lg font-medium">
                    <UserVotes
                      recipientId={grant.recipientId}
                      contract={getEthAddress(grant.parent)}
                    />
                  </p>
                </div>
                <ClaimableBalance
                  recipient={grant.recipient}
                  claimableBalance={grant.claimableBalance}
                />
              </div>
            </CardContent>
          </Card>
          {Number(votesCount) > 0 && (
            <Voters contract={getEthAddress(parent)} recipientId={recipientId} />
          )}
        </div>
      </div>
    </div>
  )
}
