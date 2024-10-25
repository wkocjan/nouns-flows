import { Comments } from "@/components/comments/comments"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateTime } from "@/components/ui/date-time"
import { Markdown } from "@/components/ui/markdown"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database"
import { getTcrCosts } from "@/lib/tcr/get-tcr-costs"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import { Metadata } from "next"
import Image from "next/image"
import { Suspense } from "react"
import { CreatorCard } from "./creator-card"
import { DraftPublishButton } from "./draft-publish-button"

interface Props {
  params: {
    draftId: string
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { draftId } = props.params

  const draft = await database.draft.findFirstOrThrow({
    where: { id: Number(draftId) },
  })

  return { title: draft.title, description: draft.tagline }
}

export default async function DraftPage({ params }: Props) {
  const { draftId } = params

  const draft = await database.draft.findUniqueOrThrow({
    where: { id: Number(draftId) },
    include: { flow: true },
  })

  const { title, description, flow, image, isOnchain, createdAt, users, isFlow } = draft

  const costs = getTcrCosts(flow)

  return (
    <div className="container mt-2.5 pb-24 md:mt-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Flows</BreadcrumbLink>
          </BreadcrumbItem>

          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink href={`/flow/${flow.id}/drafts`}>{flow.title} Drafts</BreadcrumbLink>
            </BreadcrumbItem>
          </>

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
              className="size-16 shrink-0 rounded-md object-cover"
            />
            <div>
              <h1 className="text-xl font-bold md:text-3xl">{title}</h1>
            </div>
          </div>
          <div className="mt-6 space-y-5 text-pretty text-sm md:text-base">
            <Markdown>{description}</Markdown>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Builders</h4>
                  <div className="mt-1 flex space-x-0.5">
                    {users.map((user) => (
                      <UserProfile address={getEthAddress(user)} key={user}>
                        {(profile) => (
                          <Avatar className="size-7 bg-accent text-xs">
                            <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                            <AvatarFallback>{profile.display_name[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                        )}
                      </UserProfile>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Created At</h4>
                  <DateTime
                    date={createdAt}
                    options={{
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    }}
                  />
                </div>

                <div>
                  <h4 className="mb-1 text-[13px] text-muted-foreground">Type</h4>
                  <p>{isFlow ? "Flow" : "Grant"}</p>
                </div>

                <div>
                  <h4 className="mb-1 text-[13px] text-muted-foreground">Onchain status</h4>
                  {isOnchain && <p>Yes</p>}
                  {!isOnchain && <DraftPublishButton draft={draft} flow={flow} />}
                </div>
              </div>
            </CardContent>
          </Card>

          <Suspense>
            <CreatorCard
              draft={draft}
              cost={(await costs).addItemCost}
              symbol={(await costs).symbol}
            />
          </Suspense>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <Comments commentableId={`draft-${flow.id}-${draft.id}`} maxHeight={450} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
