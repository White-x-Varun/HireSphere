import mongoose, { Schema, type Document } from "mongoose";
import { z } from "zod";

export interface Resume extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  extractedText: string;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    extractedText: { type: String, required: true },
    skills: { type: [String], default: [] },
  },
  { timestamps: true }
);

ResumeSchema.virtual("id").get(function (this: any) {
  return this._id.toHexString();
});

ResumeSchema.set("toJSON", { virtuals: true });
ResumeSchema.set("toObject", { virtuals: true });

export const Resume = mongoose.models.Resume || mongoose.model<Resume>("Resume", ResumeSchema);

export const insertResumeSchema = z.object({
  userId: z.string(),
  fileName: z.string(),
  extractedText: z.string(),
  skills: z.array(z.string()).default([]),
});

export type InsertResume = z.infer<typeof insertResumeSchema>;
