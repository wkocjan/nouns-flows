import { drizzle } from "drizzle-orm/neon-serverless"
import { Pool } from "@neondatabase/serverless"

const pool = new Pool({
  connectionString: process.env.EMBEDDINGS_POSTGRES_URL as string,
})

export const embeddingsDb = drizzle(pool)
