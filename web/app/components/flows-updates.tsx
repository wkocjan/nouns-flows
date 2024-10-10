import { CastCard } from "@/components/ui/cast-card"
import database from "@/lib/database"
import "server-only"

export const FlowsUpdates = async () => {
  const casts = await database.cast.findMany({
    where: {
      grantId: { not: null },
    },
    orderBy: { createdAt: "desc" },
    take: 11,
    include: { user: true, grant: { select: { title: true, image: true } } },
  })

  return (
    <section>
      <div className="flex items-center space-x-4">
        <h3 className="font-semibold leading-none tracking-tight md:text-lg">Updates</h3>
        <p className="translate-y-px text-sm text-muted-foreground">Latest news from builders</p>
      </div>

      {casts.length > 0 && (
        <div className="mt-4 columns-1 gap-2.5 space-y-2.5 sm:columns-2 lg:columns-3 xl:columns-4">
          {casts.map((cast) => (
            <CastCard key={cast.hash} cast={cast} />
          ))}
        </div>
      )}
    </section>
  )
}
