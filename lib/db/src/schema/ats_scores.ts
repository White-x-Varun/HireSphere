import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { resumesTable } from "./resumes";
import { jobsTable } from "./jobs";

export const atsScoresTable = pgTable("ats_scores", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").notNull().references(() => resumesTable.id),
  jobId: integer("job_id").references(() => jobsTable.id),
  score: real("score").notNull(),
  matchedKeywords: text("matched_keywords").array().notNull().default([]),
  missingKeywords: text("missing_keywords").array().notNull().default([]),
  totalKeywords: integer("total_keywords").notNull(),
  jobTitle: text("job_title"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAtsScoreSchema = createInsertSchema(atsScoresTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAtsScore = z.infer<typeof insertAtsScoreSchema>;
export type AtsScore = typeof atsScoresTable.$inferSelect;
