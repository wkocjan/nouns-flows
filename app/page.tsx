import { GrantsList } from "@/components/grants-list"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="container">
      <section className="mt-12">
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
          Nouns Grants Playground
        </h1>

        <Button variant="default" className="mt-4" size="lg">
          Apply for a grant
        </Button>

        <div className="mt-12">
          <GrantsList />
        </div>
      </section>
    </main>
  )
}
