import { z } from "zod"

const gradient = z.object({
  light: z.object({ text: z.string(), gradientStart: z.string(), gradientEnd: z.string() }),
  dark: z.object({ text: z.string(), gradientStart: z.string(), gradientEnd: z.string() }),
})

export const grantPageSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  coverImage: z.object({
    url: z.string(),
    position: z
      .enum(["top", "center", "bottom"])
      .describe("Vertical position of the focal point or main subject in the image"),
    alt: z.string(),
  }),
  why: z.object({ text: z.string(), image: z.string() }),
  how: z.object({ text: z.string(), icon: z.string(), gradient }),
  who: z.object({ text: z.string(), gradient }),
  focus: z.object({ text: z.string(), gradient }),
  metrics: z.array(z.object({ label: z.string(), value: z.number() })).min(4),
  builder: z.object({
    bio: z.string(),
    links: z.array(z.object({ title: z.string(), url: z.string(), icon: z.string() })),
    tags: z.array(z.string()),
  }),
  media: z.array(z.object({ url: z.string(), alt: z.string() })).min(2),
  plan: z.array(z.object({ title: z.string(), description: z.string() })),
  timeline: z.array(z.object({ date: z.string(), title: z.string() })),
  cards: z.array(z.object({ title: z.string(), description: z.string(), icon: z.string() })),
})

export type GrantPageData = z.infer<typeof grantPageSchema>
