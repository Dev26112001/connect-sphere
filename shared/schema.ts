import { pgTable, text, serial, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
export * from "./models/auth";
import { users } from "./models/auth";

export const intentions = pgTable("intentions", {
  id: serial("id").primaryKey(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., "Hobbies", "Discussion", "Activity"
  tags: text("tags").array(), // e.g., ["chess", "strategy"]
  location: text("location"), // Optional: "Remote", "New York", etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  intentionId: integer("intention_id").notNull().references(() => intentions.id),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const intentionsRelations = relations(intentions, ({ one, many }) => ({
  creator: one(users, {
    fields: [intentions.creatorId],
    references: [users.id],
  }),
  connections: many(connections),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  intention: one(intentions, {
    fields: [connections.intentionId],
    references: [intentions.id],
  }),
  requester: one(users, {
    fields: [connections.requesterId],
    references: [users.id],
  }),
}));

// Schemas
export const insertIntentionSchema = createInsertSchema(intentions).omit({ 
  id: true, 
  creatorId: true, 
  createdAt: true 
});

export const insertConnectionSchema = createInsertSchema(connections).omit({ 
  id: true, 
  intentionId: true, 
  requesterId: true, 
  status: true, 
  createdAt: true 
});

// Types
export type Intention = typeof intentions.$inferSelect;
export type InsertIntention = z.infer<typeof insertIntentionSchema>;
export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;

export type CreateIntentionRequest = InsertIntention;
export type CreateConnectionRequest = InsertConnection & { intentionId: number };
export type UpdateConnectionStatusRequest = { status: "accepted" | "rejected" };
