import * as dotenv from "dotenv"
import pg from "pg"
import path from "path"
import { existsSync } from "fs"

const { Client } = pg

const envPath = existsSync(path.resolve(process.cwd(), ".env.local")) ? ".env.local" : ".env"

dotenv.config({ path: path.resolve(process.cwd(), envPath) })

async function createSchemaView() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  })

  try {
    await client.connect()

    const commitSHA = process.env.RAILWAY_GIT_COMMIT_SHA
    if (!commitSHA) {
      throw new Error("RAILWAY_GIT_COMMIT_SHA environment variable is not set")
    }

    const viewName = process.env.DATABASE_SCHEMA || "onchain"

    const createViewQuery = `
      DO $$ 
      DECLARE
        tbl record;
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = '${commitSHA}') THEN
          DROP SCHEMA IF EXISTS ${viewName} CASCADE;
          
          CREATE SCHEMA IF NOT EXISTS ${viewName};
          
          FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = '${commitSHA}')
          LOOP
            EXECUTE format('CREATE VIEW ${viewName}.%I AS SELECT * FROM "${commitSHA}".%I', 
              tbl.tablename, 
              tbl.tablename
            );
          END LOOP;
          
          RAISE NOTICE 'Successfully created ${viewName} views for schema: ${commitSHA}';
        ELSE
          RAISE EXCEPTION 'Schema ${commitSHA} does not exist';
        END IF;
      END $$
      LANGUAGE plpgsql;
    `

    await client.query(createViewQuery)
    console.log(`✅ Successfully created ${viewName} views for schema: ${commitSHA}`)
  } catch (error) {
    console.error("❌ Error creating schema view:", error)
    throw error
  } finally {
    await client.end()
  }
}

createSchemaView().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
