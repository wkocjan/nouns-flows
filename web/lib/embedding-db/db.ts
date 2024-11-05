import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.EMBEDDINGS_POSTGRES_URL as string,
})

export const embeddingsDb = drizzle(pool)
