import { CategoriesList } from "@/components/categories/list"
import { categories } from "@/lib/data/categories"

export default function Home() {
  return (
    <main className="container">
      <section className="mt-12">
        <CategoriesList categories={categories} />
      </section>
    </main>
  )
}
