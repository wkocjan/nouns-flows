import { pgTable, text, timestamp, varchar, vector, integer } from "drizzle-orm/pg-core"
import { validTypes } from "../types/job"

export const embeddings = pgTable("embeddings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  type: varchar("type", { length: 50 }).$type<(typeof validTypes)[number]>(), // Typed to match JobBody type
  version: integer("version").default(1),
  content: text("content"),
  contentHash: varchar("content_hash", { length: 64 }).unique(),
  embedding: vector("embedding", { dimensions: 1536 }), // Store as vector
  groups: text("groups").array(), // Array of groups/communities eg: nouns
  users: text("users").array(), // Array of user addresses
  tags: text("tags").array(), // Array of tags for future use maybe
  externalId: text("external_id"), // id helpful for linking to other tables / documents
  urls: text("urls").array(), // Array of urls
  urlSummaries: text("url_summaries").array(), // Array of url summaries
})
