import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getCategories } from "@/lib/data/categories"
import Image from "next/image"
import Link from "next/link"

export default async function ApplyPage() {
  const categories = await getCategories()

  return (
    <main className="container mt-8 pb-12">
      <div className="mx-auto max-w-screen-lg">
        <h3 className="font-semibold leading-none tracking-tight">
          Apply for a Grant
        </h3>
        <p className="mt-1.5 text-balance text-sm text-muted-foreground">
          Start your grant application by selecting the category that best fits
          your project. Each category has a specific focus and budget.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              href={`/apply/${category.id}`}
              key={category.id}
              className="group transition-transform md:hover:-translate-y-2"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <Image
                      src={category.imageUrl}
                      alt={category.title}
                      width={64}
                      height={64}
                      className="mb-4 rounded-full object-cover"
                    />
                    <h3 className="text-center text-lg font-semibold transition-colors group-hover:text-primary">
                      {category.title}
                    </h3>
                    <p className="mb-2 text-center text-sm text-muted-foreground">
                      {category.tagline}
                    </p>
                    <Badge className="mt-2">
                      ${category.budget.toLocaleString("en-US")}/mo
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
