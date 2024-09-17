import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { NOUNS_FLOW_PROXY } from "@/lib/config"
import database from "@/lib/database"
import { getIpfsUrl } from "@/lib/utils"
import { VotingProvider } from "@/lib/voting/voting-context"
import Image from "next/image"
import Link from "next/link"
import { base } from "viem/chains"
import { VotingBar } from "./flow/[flowId]/components/voting-bar"
import { VotingInput } from "./flow/[flowId]/components/voting-input"
import { VotingToggle } from "./flow/[flowId]/components/voting-toggle"

export default async function Home() {
  const flows = await database.grant.findMany({
    where: { isFlow: 1, isRemoved: 0, parent: NOUNS_FLOW_PROXY },
    include: {
      _count: { select: { subgrants: { where: { isFlow: 0, isRemoved: 0 } } } },
    },
  })

  return (
    <VotingProvider chainId={base.id} contract={NOUNS_FLOW_PROXY}>
      <main className="container mt-2.5 pb-24 md:mt-8">
        <div className="flex flex-col max-sm:space-y-2.5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-semibold leading-none tracking-tight">Welcome to Nouns Flows</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Here are some flows to explore. Better copy coming soon.
            </p>
          </div>
          <VotingToggle />
        </div>

        <Card className="mt-6">
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
                {flows.map((flow) => (
                  <TableRow key={flow.title}>
                    <TableCell className="min-w-[64px] md:w-[92px]">
                      <Image
                        src={getIpfsUrl(flow.image)}
                        alt={flow.title}
                        width={64}
                        height={64}
                        className="aspect-square size-12 rounded-md object-cover md:size-16"
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/flow/${flow.id}`}
                        className="font-medium duration-100 ease-out hover:text-primary md:text-lg"
                        tabIndex={-1}
                      >
                        {flow.title}
                      </Link>
                      <p className="text-xs tracking-tight text-muted-foreground max-sm:hidden md:text-sm">
                        {flow.tagline}
                      </p>
                    </TableCell>
                    <TableCell className="space-x-1 text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="success">{flow._count.subgrants}</Badge>
                        </TooltipTrigger>
                        <TooltipContent>Approved</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="warning">?</Badge>
                        </TooltipTrigger>
                        <TooltipContent>Challenged</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline">?</Badge>
                        </TooltipTrigger>
                        <TooltipContent>Awaiting</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge>
                        {Intl.NumberFormat("en", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }).format(Number(flow.monthlyFlowRate))}
                        /mo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{flow.votesCount}</TableCell>
                    <TableCell className="w-[100px] max-w-[100px] text-center">
                      <VotingInput recipientId={flow.recipientId} />
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
