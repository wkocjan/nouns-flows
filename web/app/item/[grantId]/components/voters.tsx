/* eslint-disable @next/next/no-img-element */
import "server-only"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserProfile } from "@/components/user-profile/user-profile"
import database from "@/lib/database/edge"
import { getEthAddress } from "@/lib/utils"

interface Props {
  contract: `0x${string}`
  recipientId: string
}

export const Voters = async (props: Props) => {
  const { contract, recipientId } = props

  const votes = database.vote.groupBy({
    by: ["voter"],
    where: { contract, recipientId, isStale: 0 },
    _count: { tokenId: true },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(await votes).map((v) => (
            <UserProfile address={getEthAddress(v.voter)} key={v.voter}>
              {(profile) => (
                <div className="flex items-center">
                  <Avatar className="mr-2.5 aspect-square size-7 rounded-full">
                    <AvatarImage src={profile.pfp_url} alt={profile.display_name} />
                    <AvatarFallback>{profile.display_name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <span className="mr-1 text-sm font-medium">{profile.display_name}</span>
                  <span className="text-xs text-muted-foreground">({v._count.tokenId})</span>
                </div>
              )}
            </UserProfile>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
