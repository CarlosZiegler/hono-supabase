import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().notNull(),
	email: text("email"),
	createdAt: timestamp("created_at", { mode: "string" }).notNull().default(sql`now()`),
	updatedAt: timestamp("updated_at", { mode: "string" }).notNull().default(sql`now()`),
});
