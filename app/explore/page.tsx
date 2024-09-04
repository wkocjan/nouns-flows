import { categories } from "@/lib/data/categories"
import { CategoriesDiagram } from "./diagram"

export default function ExplorePage() {
  return (
    <main className="flex grow flex-col">
      <CategoriesDiagram categories={categories} />
    </main>
  )
}
