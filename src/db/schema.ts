import {
  pgTable,
  integer,
  text,
  timestamp,
  varchar,
  index
} from "drizzle-orm/pg-core";

export const ticketCounter = pgTable("ticket_counter", {
  ticketCounterId: integer("id").primaryKey(),
  end: integer("end").notNull(),
  current: integer("current").notNull(),
});

export const users = pgTable("users", {
  userId: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 254 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
});

export const urls = pgTable(
  "urls",
  {
    codeId: integer("id").primaryKey(),
    originalUrl: text("original_url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    userId: integer("user_id").references(() => users.userId).notNull(),
  },
  (t) => [index("urls_user_id_idx").on(t.userId)],
);

export type TicketCounter = typeof ticketCounter.$inferSelect;
export type UrlRecord = typeof urls.$inferSelect;
export type NewUrlRecord = typeof urls.$inferInsert;
export type NewUserRecord = typeof users.$inferInsert;
export type UserRecord = typeof users.$inferSelect