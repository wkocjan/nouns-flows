import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { categories } from "@/lib/data/categories"
import { GRANTS_CONTRACT } from "@/lib/wagmi/contracts"
import Image from "next/image"
import Link from "next/link"
import { base } from "viem/chains"
import { VotingBar } from "./category/[categoryId]/components/voting-bar"
import { VotingProvider } from "./category/[categoryId]/components/voting-context"
import { VotingInput } from "./category/[categoryId]/components/voting-input"
import { VotingToggle } from "./category/[categoryId]/components/voting-toggle"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

export default function Home() {
  return (
    <VotingProvider chainId={base.id} userVotes={[]} contract={GRANTS_CONTRACT}>
      <main className="container mt-2.5 pb-24 md:mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle>Welcome to Nouns Flows</CardTitle>
                <CardDescription>
                  Here are some categories to explore. Better copy coming soon.
                </CardDescription>
              </div>
              <VotingToggle />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2}>Name</TableHead>
                  <TableHead className="text-center"># Grants</TableHead>
                  <TableHead className="text-center">Budget</TableHead>
                  <TableHead className="text-center">Total Votes</TableHead>
                  <TableHead className="text-center">Your Vote</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.title}>
                    <TableCell className="min-w-[64px] md:w-[92px]">
                      <Image
                        src={category.imageUrl}
                        alt={category.title}
                        width={64}
                        height={64}
                        className="aspect-square size-12 rounded-md object-cover md:size-16"
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/category/${category.id}`}
                        className="font-medium duration-100 ease-out hover:text-primary md:text-lg"
                        tabIndex={-1}
                      >
                        {category.title}
                      </Link>
                      <p className="text-xs tracking-tight text-muted-foreground max-sm:hidden md:text-sm">
                        {category.tagline}
                      </p>
                    </TableCell>
                    <TableCell className="space-x-1 text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="success">2</Badge>
                        </TooltipTrigger>
                        <TooltipContent>Approved</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="warning">2</Badge>
                        </TooltipTrigger>
                        <TooltipContent>Challenged</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline">2</Badge>
                        </TooltipTrigger>
                        <TooltipContent>Awaiting</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge>
                        ${category.budget.toLocaleString("en-US")}/mo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {category.votes}
                    </TableCell>
                    <TableCell className="w-[100px] max-w-[100px] text-center">
                      <VotingInput recipient={category.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <VotingBar />
    </VotingProvider>
  )
}
