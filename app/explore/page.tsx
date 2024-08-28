import { CategoriesDiagram } from "@/components/categories/diagram"
import { categories } from "@/lib/data/categories"

export default function ExplorePage() {
  return (
    <main className="flex grow flex-col">
      <CategoriesDiagram categories={categories} />
    </main>
  )
}
