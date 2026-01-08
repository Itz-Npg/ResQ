import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  deviceId: text("device_id").notNull().unique(), // stored in localStorage
  email: text("email").unique(),
  password: text("password"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  lastSeen: integer("last_seen", { mode: 'timestamp' }).default(new Date()),
  name: text("name"), // Optional name
});

export const alerts = sqliteTable("alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  deviceId: text("device_id").notNull(), // Who sent it
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  level: integer("level").default(1).notNull(), // 1: Immediate, 2: Urgent, 3: Semi-urgent
  message: text("message").notNull(),
  active: integer("active", { mode: 'boolean' }).default(true),
  helperId: integer("helper_id").references(() => users.id),
  isResqued: integer("is_resqued", { mode: 'boolean' }).default(false), // Help verified by requester
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
});

// === SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).pick({
  deviceId: true,
  latitude: true,
  longitude: true,
  name: true,
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  deviceId: true,
  latitude: true,
  longitude: true,
  level: true,
  message: true,
}).extend({
  deviceId: z.string(),
});

// === TYPES ===
export type User = typeof users.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
