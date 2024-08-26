import "server-only"

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
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserProfile } from "@/components/user-profile/user-profile"
import { getCategory } from "@/lib/data/categories"
import { getGrantsForCategory } from "@/lib/data/grants"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import Image from "next/image"
import Link from "next/link"
import { CategoryHeader } from "./components/CategoryHeader"

interface Props {
  params: {
    categoryId: string
  }
}

export default async function CategoryPage(props: Props) {
  const { categoryId } = props.params

  const category = await getCategory(categoryId)
  const grants = getGrantsForCategory(categoryId)

  return (
    <div className="container mt-2.5 pb-12 md:mt-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Categories</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{category.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CategoryHeader category={category} grants={grants} />

      <div className="mb-4 mt-10 flex items-center justify-between">
        <div className="flex items-center space-x-7">
          <h2 className="text-xl font-semibold">Approved Grants</h2>
          <h2 className="group flex items-center space-x-2 text-xl font-semibold">
            <span className="opacity-50 duration-100 ease-in-out group-hover:opacity-100">
              Awaiting Submissions
            </span>{" "}
            <Badge variant="default">3</Badge>
          </h2>
        </div>
        <Button>Voting on/off</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[350px]">Name</TableHead>
            <TableHead>Builders</TableHead>
            <TableHead className="text-center">Earned</TableHead>
            <TableHead className="text-center">Budget</TableHead>
            <TableHead className="text-center">Total Votes</TableHead>
            <TableHead className="text-right">Your Vote</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grants.map((grant) => (
            <TableRow key={grant.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-4">
                  <Image
                    alt={`${grant.title} image`}
                    className="rounded-lg object-cover"
                    height="48"
                    src={grant.imageUrl}
                    width="48"
                  />
                  <div>
                    <h4 className="mb-1 text-[15px] font-medium">
                      {grant.title}
                    </h4>
                    {grant.isChallenged && (
                      <HoverCard openDelay={250}>
                        <HoverCardTrigger>
                          <Badge variant="warning">
                            <ExclamationTriangleIcon className="mr-1" />
                            Challenged
                          </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex space-x-1 whitespace-normal">
                            Remaining days + your vote + button
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-0.5">
                  {grant.users.map((user) => (
                    <Link href="#" key={user}>
                      <UserProfile address={user}>
                        {(profile) => (
                          <Avatar className="size-7 bg-accent text-xs">
                            <AvatarImage
                              src={profile.pfp_url}
                              alt={profile.display_name}
                            />
                            <AvatarFallback>
                              {profile.display_name[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </UserProfile>
                    </Link>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-center">
                ${grant.earned.toLocaleString("en-US")}
              </TableCell>
              <TableCell className="text-center">
                <Badge>${grant.budget.toLocaleString("en-US")}/mo</Badge>
              </TableCell>
              <TableCell className="text-center">
                {grant.votes.toLocaleString("en-US")}
              </TableCell>
              {/* <TableCell className="flex flex-col items-start space-y-2">
                {grant.isApproved && <Badge variant="success">Approved</Badge>}

                {grant.isChallenged && (
                  <Badge variant="warning">Challenged</Badge>
                )}

                {!grant.isApproved && (grant.daysLeft || 0) > 0 && (
                  <Badge variant="outline">Awaiting</Badge>
                )}

                {grant.daysLeft && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {grant.daysLeft} days left
                  </p>
                )}
              </TableCell> */}

              <TableCell className="w-[100px] max-w-[100px]">
                <div className="flex justify-end">
                  <Input placeholder="0" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
