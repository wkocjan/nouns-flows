import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCategory } from "@/lib/data/categories"
import { getGrantsForCategory } from "@/lib/data/grants"
import Image from "next/image"

interface Props {
  params: {
    categoryId: string
  }
}

export default function CategoryPage(props: Props) {
  const { categoryId } = props.params

  const category = getCategory(categoryId)
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

      <Card className="mb-6">
        <CardHeader className="flex flex-col items-center justify-between space-y-4 p-4 md:flex-row md:space-y-0 md:p-6">
          <div className="flex flex-col items-center text-center md:flex-row md:space-x-4 md:text-left">
            <Image
              src={category.imageUrl}
              alt={category.title}
              className="mb-2 rounded-lg object-cover md:mb-0"
              height="60"
              width="60"
            />
            <div>
              <CardTitle className="text-xl font-bold">
                {category.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {category.tagline}
              </CardDescription>
            </div>
          </div>
          <div className="grid w-full grid-cols-2 gap-4 text-sm md:w-auto md:grid-cols-4">
            <div className="text-center">
              <p className="mb-1 text-muted-foreground">Grants</p>
              <p className="font-medium">{grants.length}</p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-muted-foreground">Budget</p>
              <p className="font-medium">
                $
                {grants
                  .reduce((sum, grant) => sum + grant.budget, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-muted-foreground">Total Votes</p>
              <p className="font-medium">
                {grants
                  .reduce((sum, grant) => sum + grant.votes, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-muted-foreground">Your Vote</p>
              <p className="font-medium">0%</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Grants</h2>
        <Button>Voting on/off</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[350px]">Name</TableHead>
            <TableHead>Builders</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Earned</TableHead>
            <TableHead>Total Votes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                    <p className="text-[15px] font-medium">{grant.title}</p>
                    {/* <p className="text-wrap text-[13px] leading-tight text-muted-foreground">
                      {grant.tagline}
                    </p> */}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-0.5">
                  {grant.users.map((user) => (
                    <Avatar key={user} className="size-6">
                      <AvatarFallback>T</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge>${grant.budget.toLocaleString()}</Badge>
              </TableCell>
              <TableCell>${grant.earned.toLocaleString()}</TableCell>
              <TableCell>{grant.votes.toLocaleString()}</TableCell>
              <TableCell className="flex flex-col items-start space-y-2">
                {grant.isApproved && <Badge>Approved</Badge>}

                {grant.isChallenged && (
                  <Badge variant="destructive">In Challenge</Badge>
                )}

                {!grant.isApproved && (grant.daysLeft || 0) > 0 && (
                  <Badge variant="outline">Awaiting</Badge>
                )}

                {grant.daysLeft && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {grant.daysLeft} days left
                  </p>
                )}
              </TableCell>

              <TableCell className="text-right">
                <Button size="sm" variant="outline">
                  Challenge
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
