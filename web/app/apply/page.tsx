import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import database from "@/lib/database"
import { getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

export default async function ApplyPage() {
  const flows = await database.grant.findMany({
    where: { isFlow: 1, isRemoved: 0 },
  })

  return (
    <main className="container mt-8 pb-12">
      <div className="mx-auto max-w-screen-lg">
        <h3 className="font-semibold leading-none tracking-tight">Apply for a Grant</h3>
        <p className="mt-1.5 text-balance text-sm text-muted-foreground">
          Start your grant application by selecting the flow that best fits your project. Each flow
          has a specific focus and budget.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {flows.map((flow) => (
            <Link
              href={`/apply/${flow.id}`}
              key={flow.id}
              className="group transition-transform md:hover:-translate-y-2"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <Image
                      src={getIpfsUrl(flow.image)}
                      alt={flow.title}
                      width={64}
                      height={64}
                      className="mb-4 size-16 rounded-full object-cover"
                    />
                    <h3 className="text-center text-lg font-semibold transition-colors group-hover:text-primary">
                      {flow.title}
                    </h3>
                    <p className="mb-2 text-center text-sm text-muted-foreground">{flow.tagline}</p>
                    <Badge className="mt-2">
                      {Intl.NumberFormat("en", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }).format(Number(flow.monthlyFlowRate))}
                      /mo
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
