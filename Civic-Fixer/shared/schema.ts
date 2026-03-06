import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  problemType: text("problem_type").notNull(),
  severity: text("severity").notNull(), // High | Medium | Low
  description: text("description").notNull(),
  communityImpact: text("community_impact").notNull(),
  authority: text("authority").notNull(),
  estimatedFixTime: text("estimated_fix_time").notNull(),
  actions: json("actions").notNull(), // array of strings
  upvotes: integer("upvotes").default(0).notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  upvotes: true,
  status: true,
  createdAt: true,
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type CreateReportRequest = InsertReport;
export type UpdateReportRequest = Partial<InsertReport>;
export type ReportResponse = Report;
