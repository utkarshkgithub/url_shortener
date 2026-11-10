import { pgTable, integer, bigint, varchar, text, timestamp, index } from "drizzle-orm/pg-core"

export const ticketCounter = pgTable("ticket_counter",{
    id: integer("id").primaryKey(),
    end: integer("end").notNull(),
    current: integer("current").notNull(), 
})

export const urls = pgTable("urls",{
    id: integer("id").primaryKey(),
    shortCode: varchar("short_code",{length: 10}).unique().notNull(),
    originalUrl: text("original_url").notNull(),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
})

export type TicketCounter = typeof ticketCounter.$inferSelect;
export type UrlRecord = typeof urls.$inferSelect;
export type NewUrlRecord = typeof urls.$inferInsert;