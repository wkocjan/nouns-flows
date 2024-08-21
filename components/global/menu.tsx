"use client"

import { cn } from "@/lib/utils"
import { useSelectedLayoutSegments } from "next/navigation"

const options = [
  { name: "Categories", href: "/", icon: null },
  { name: "Diagram", href: "/diagram", icon: null },
  { name: "Apply for a grant", href: "/apply", icon: null },
  { name: "About", href: "/about", icon: null },
] as const

export function Menu() {
  const segments = useSelectedLayoutSegments()

  return (
    <div className="border-b">
      <nav className="-mb-px flex space-x-8">
        {options.map((option) => {
          const isCurrent = option.href === `/${segments[0] || ""}`
          return (
            <a
              key={option.name}
              href={option.href}
              className={cn("group border-b-2 px-1 pb-3 font-medium", {
                "border-primary text-primary": isCurrent,
                "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground":
                  !isCurrent,
              })}
            >
              {/* <tab.icon
                  aria-hidden="true"
                  className={cn(
                    tab.current ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                    '-ml-0.5 mr-2 h-5 w-5',
                  )}
                /> */}
              <span>{option.name}</span>
            </a>
          )
        })}
      </nav>
    </div>
  )
}
