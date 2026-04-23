import mongoose, { Schema, type Document } from "mongoose";
import { z } from "zod";

export interface AtsScore extends Document {
  resumeId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalKeywords: number;
  jobTitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AtsScoreSchema: Schema = new Schema(
  {
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    score: { type: Number, required: true },
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    totalKeywords: { type: Number, required: true },
    jobTitle: { type: String },
  },
  { timestamps: true }
);

AtsScoreSchema.virtual("id").get(function (this: any) {
  return this._id.toHexString();
});

AtsScoreSchema.set("toJSON", { virtuals: true });
AtsScoreSchema.set("toObject", { virtuals: true });

export const AtsScore = mongoose.models.AtsScore || mongoose.model<AtsScore>("AtsScore", AtsScoreSchema);

export const insertAtsScoreSchema = z.object({
  resumeId: z.string(),
  jobId: z.string().optional(),
  score: z.number(),
  matchedKeywords: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
  totalKeywords: z.number(),
  jobTitle: z.string().optional(),
});

export type InsertAtsScore = z.infer<typeof insertAtsScoreSchema>;
