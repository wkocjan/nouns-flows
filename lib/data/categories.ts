export type Category = {
  id: string
  imageUrl: string
  title: string
  tagline: string
  budget: number
  votes: number
}

export async function getCategory(categoryId: string): Promise<Category> {
  const category = categories.find((c) => c.id === categoryId)
  if (!category) throw new Error(`Category ${categoryId} not found`)
  return category
}

export async function getCategories(): Promise<Category[]> {
  return categories
}

export const categories: Category[] = [
  {
    id: "category-1",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/QmZJiq3RttEKd8PaK2AfZyKD1XszU1eBgVUg33YexM71uK",
    title: "Local Impact",
    tagline: "Funding projects that strengthen community ties",
    budget: 500,
    votes: 125,
  },
  {
    id: "category-2",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/Qma43CeHGZ6uRcxcC4LocxX2K1RVGzMemhMhnoNV7ZTmu3",
    title: "Events & Meetups",
    tagline: "Organizing gatherings to share ideas and experiences",
    budget: 250,
    votes: 80,
  },
  {
    id: "category-3",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/QmfZMtW2vDcdfH3TZdNAbMNm4Z1y16QHjuFwf8ff2NANAt",
    title: "Nouns Proliferation",
    tagline: "Incentivizing contributions to the community",
    budget: 750,
    votes: 200,
  },
  {
    id: "category-4",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/QmZJiq3RttEKd8PaK2AfZyKD1XszU1eBgVUg33YexM71uK",
    title: "Governance clients",
    tagline: "Supporting initiatives that enhance decision-making",
    budget: 300,
    votes: 50,
  },
  {
    id: "category-5",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/Qma43CeHGZ6uRcxcC4LocxX2K1RVGzMemhMhnoNV7ZTmu3",
    title: "Nounish media",
    tagline: "Backing projects that promote Nouns culture",
    budget: 1000,
    votes: 175,
  },
  {
    id: "category-6",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/Qma43CeHGZ6uRcxcC4LocxX2K1RVGzMemhMhnoNV7ZTmu3",
    title: "Help those in need",
    tagline: "Providing support for essential community services",
    budget: 800,
    votes: 120,
  },
  {
    id: "category-7",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/QmfZMtW2vDcdfH3TZdNAbMNm4Z1y16QHjuFwf8ff2NANAt",
    title: "Education & Research",
    tagline:
      "Funding initiatives that advance knowledge in the Nouns ecosystem",
    budget: 600,
    votes: 90,
  },
  {
    id: "category-8",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/QmZJiq3RttEKd8PaK2AfZyKD1XszU1eBgVUg33YexM71uK",
    title: "Ecosystem Growth",
    tagline: "Supporting projects that expand the Nouns ecosystem",
    budget: 1200,
    votes: 150,
  },
]
