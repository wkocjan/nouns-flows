import { CategoriesList } from "@/components/categories/list"
import { categories } from "@/lib/data/categories"

export default function Home() {
  return (
    <main className="container mt-2.5 pb-12 md:mt-6">
      <CategoriesList categories={categories} />
    </main>
  )
}
