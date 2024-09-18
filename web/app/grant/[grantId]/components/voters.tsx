import "server-only"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database"
import { getEthAddress } from "@/lib/utils"
import Image from "next/image"
import { Suspense } from "react"

interface Props {
  contract: `0x${string}`
  recipientId: string
}

export const Voters = async (props: Props) => {
  const { contract, recipientId } = props

  const votes = database.vote.findMany({
    select: { tokenId: true, voter: true },
    where: { contract, recipientId, isStale: 0 },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Suspense>
            {(await votes).map((v) => (
              <Tooltip key={v.tokenId}>
                <TooltipTrigger asChild>
                  <Image
                    src={`https://noun.pics/${v.tokenId}.svg`}
                    alt="Noun"
                    className="aspect-square size-8 rounded-full"
                    width={32}
                    height={32}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <h3 className="text-sm font-medium">Noun {v.tokenId}</h3>
                  by{" "}
                  <UserProfile address={getEthAddress(v.voter)}>
                    {(profile) => <span>{profile.display_name}</span>}
                  </UserProfile>
                </TooltipContent>
              </Tooltip>
            ))}
          </Suspense>
        </div>
      </CardContent>
    </Card>
  )
}
