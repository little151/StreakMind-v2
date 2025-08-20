import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  badges: jsonb("badges").notNull().default([]),
  settings: jsonb("settings").notNull().default({}),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  category: text("category").notNull(), // coding, gym, sleep, etc.
  description: text("description"),
  pointsPerCompletion: integer("points_per_completion").notNull().default(10),
  visualizationType: text("visualization_type").notNull().default("calendar"), // calendar, circle, bar
  currentStreak: integer("current_streak").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const habitEntries = pgTable("habit_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  habitId: varchar("habit_id").notNull().references(() => habits.id),
  value: integer("value").notNull().default(1), // 1 for completion, hours for sleep, etc.
  points: integer("points").notNull().default(0),
  date: timestamp("date").notNull().default(sql`now()`),
  metadata: jsonb("metadata").notNull().default({}),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isFromUser: boolean("is_from_user").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  habitEntryId: varchar("habit_entry_id").references(() => habitEntries.id),
});

export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  requirement: text("requirement").notNull(),
  category: text("category").notNull(),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
});

export const insertHabitEntrySchema = createInsertSchema(habitEntries).omit({
  id: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

export type HabitEntry = typeof habitEntries.$inferSelect;
export type InsertHabitEntry = z.infer<typeof insertHabitEntrySchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
