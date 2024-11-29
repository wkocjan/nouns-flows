import { z } from "zod"

const gradient = z.object({
  light: z.object({ text: z.string(), gradientStart: z.string(), gradientEnd: z.string() }),
  dark: z.object({ text: z.string(), gradientStart: z.string(), gradientEnd: z.string() }),
})

export const grantPageSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  coverImage: z.string(),
  why: z.object({ text: z.string(), image: z.string() }),
  how: z.object({ text: z.string(), icon: z.string(), gradient }),
  who: z.object({ text: z.string(), gradient }),
  focus: z.object({ text: z.string(), icon: z.string(), gradient }),
  metrics: z.array(z.object({ label: z.string(), value: z.number() })),
  builder: z.object({
    bio: z.string(),
    links: z.array(z.object({ title: z.string(), url: z.string(), icon: z.string() })),
    tags: z.array(z.string()),
  }),
  media: z.array(z.string()),
  plan: z.array(z.object({ title: z.string(), description: z.string() })),
  timeline: z.array(z.object({ date: z.string(), title: z.string(), description: z.string() })),
  cards: z.array(z.object({ title: z.string(), description: z.string(), icon: z.string() })),
})

export type GrantPageData = z.infer<typeof grantPageSchema>
