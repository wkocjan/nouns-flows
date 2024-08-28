import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Category } from "@/lib/data/categories"
import { Grant } from "@/lib/data/grants"
import Image from "next/image"

interface Props {
  category: Category
  grants: Grant[]
}

export const CategoryHeader = (props: Props) => {
  const { category, grants } = props

  return (
    <Card>
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
            <p className="mb-1.5 text-muted-foreground">Grants</p>
            <p className="font-medium">{grants.length}</p>
          </div>
          <div className="text-center">
            <p className="mb-1.5 text-muted-foreground">Budget</p>
            <Badge>
              $
              {grants
                .reduce((sum, grant) => sum + grant.budget, 0)
                .toLocaleString("en-US")}
              /mo
            </Badge>
          </div>
          <div className="text-center">
            <p className="mb-1.5 text-muted-foreground">Total Votes</p>
            <p className="font-medium">
              {grants
                .reduce((sum, grant) => sum + grant.votes, 0)
                .toLocaleString("en-US")}
            </p>
          </div>
          <div className="text-center">
            <p className="mb-1.5 text-muted-foreground">Your Vote</p>
            <p className="font-medium">0%</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
