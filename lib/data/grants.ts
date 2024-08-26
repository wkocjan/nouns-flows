export type Grant = {
  id: string
  imageUrl: string
  title: string
  tagline: string
  budget: number
  votes: number

  isApproved: boolean
  isChallenged: boolean
  earned: number
  users: `0x${string}`[]
  daysLeft?: number
}

export function getGrantsForCategory(categoryId: string): Grant[] {
  const count = Math.floor(Math.random() * 6) + 4
  return [...grants]
    .map((g) => ({ ...g, id: g.id + categoryId }))
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
}

export const grants: Grant[] = [
  {
    id: "grant-1",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/QmZJiq3RttEKd8PaK2AfZyKD1XszU1eBgVUg33YexM71uK",
    title: "Community Garden Project",
    tagline: "Creating a sustainable green space for local residents",
    budget: 150,
    votes: 42,
    isApproved: true,
    isChallenged: false,
    earned: 50,
    users: [
      "0x6cc34d9fb4ae289256fc1896308d387aee2bcc52",
      "0x289715ffbb2f4b482e2917d2f183feab564ec84f",
    ],
  },
  {
    id: "grant-2",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/Qma43CeHGZ6uRcxcC4LocxX2K1RVGzMemhMhnoNV7ZTmu3",
    title: "Nouns Hackathon",
    tagline: "48-hour coding event to build Nouns-inspired projects",
    budget: 200,
    votes: 35,
    isApproved: false,
    isChallenged: true,
    earned: 75,
    users: [
      "0x6cc34d9fb4ae289256fc1896308d387aee2bcc52",
      "0x289715ffbb2f4b482e2917d2f183feab564ec84f",
    ],
  },
  {
    id: "grant-3",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/QmfZMtW2vDcdfH3TZdNAbMNm4Z1y16QHjuFwf8ff2NANAt",
    title: "Nouns Art Exhibition",
    tagline: "Showcasing Nouns-inspired artwork from the community",
    budget: 175,
    votes: 28,
    isApproved: true,
    isChallenged: false,
    earned: 100,
    users: ["0x6cc34d9fb4ae289256fc1896308d387aee2bcc52"],
  },
  {
    id: "grant-4",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/QmZJiq3RttEKd8PaK2AfZyKD1XszU1eBgVUg33YexM71uK",
    title: "Decentralized Voting App",
    tagline: "Building a user-friendly mobile app for DAO governance",
    budget: 250,
    votes: 39,
    isApproved: false,
    isChallenged: false,
    earned: 125,
    users: [
      "0x6cc34d9fb4ae289256fc1896308d387aee2bcc52",
      "0x289715ffbb2f4b482e2917d2f183feab564ec84f",
    ],
    daysLeft: 2,
  },
  {
    id: "grant-5",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/Qma43CeHGZ6uRcxcC4LocxX2K1RVGzMemhMhnoNV7ZTmu3",
    title: "Nouns Podcast Series",
    tagline: "Weekly discussions on Nouns ecosystem and NFT culture",
    budget: 100,
    votes: 22,
    isApproved: true,
    isChallenged: false,
    earned: 50,
    users: ["0x6cc34d9fb4ae289256fc1896308d387aee2bcc52"],
  },
  {
    id: "grant-6",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/Qma43CeHGZ6uRcxcC4LocxX2K1RVGzMemhMhnoNV7ZTmu3",
    title: "Local Food Bank Support",
    tagline: "Providing meals and groceries to families in need",
    budget: 300,
    votes: 55,
    isApproved: false,
    isChallenged: true,
    earned: 150,
    users: [
      "0x6cc34d9fb4ae289256fc1896308d387aee2bcc52",
      "0x289715ffbb2f4b482e2917d2f183feab564ec84f",
    ],
    daysLeft: 6,
  },
  {
    id: "grant-7",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/QmZJiq3RttEKd8PaK2AfZyKD1XszU1eBgVUg33YexM71uK",
    title: "Nouns Education Initiative",
    tagline: "Developing curriculum to teach Web3 concepts in schools",
    budget: 225,
    votes: 31,
    isApproved: true,
    isChallenged: false,
    earned: 75,
    users: [
      "0x6cc34d9fb4ae289256fc1896308d387aee2bcc52",
      "0x289715ffbb2f4b482e2917d2f183feab564ec84f",
    ],
  },
  {
    id: "grant-8",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/Qma43CeHGZ6uRcxcC4LocxX2K1RVGzMemhMhnoNV7ZTmu3",
    title: "Nounish Merch Store",
    tagline: "Creating and distributing Nouns-themed merchandise",
    budget: 180,
    votes: 26,
    isApproved: false,
    isChallenged: false,
    earned: 100,
    users: [
      "0x6cc34d9fb4ae289256fc1896308d387aee2bcc52",
      "0x289715ffbb2f4b482e2917d2f183feab564ec84f",
    ],
    daysLeft: 3,
  },
  {
    id: "grant-9",
    imageUrl:
      "https://revolution.mypinata.cloud/ipfs/QmfZMtW2vDcdfH3TZdNAbMNm4Z1y16QHjuFwf8ff2NANAt",
    title: "Nouns Community Outreach",
    tagline: "Organizing workshops to introduce Nouns to new audiences",
    budget: 160,
    votes: 33,
    isApproved: false,
    isChallenged: false,
    earned: 50,
    users: [
      "0x6cc34d9fb4ae289256fc1896308d387aee2bcc52",
      "0x289715ffbb2f4b482e2917d2f183feab564ec84f",
    ],
    daysLeft: 5,
  },
]
