import mongoose, { Schema, type Document } from "mongoose";
import { z } from "zod";

export interface Job extends Document {
  title: string;
  company: string;
  description: string;
  skills: string[];
  location: string;
  type: "full_time" | "part_time" | "contract" | "remote";
  salaryMin?: number;
  salaryMax?: number;
  recruiterId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    skills: { type: [String], default: [] },
    location: { type: String, required: true },
    type: { type: String, enum: ["full_time", "part_time", "contract", "remote"], default: "full_time" },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

JobSchema.virtual("id").get(function (this: any) {
  return this._id.toHexString();
});

JobSchema.set("toJSON", { virtuals: true });
JobSchema.set("toObject", { virtuals: true });

export const Job = mongoose.models.Job || mongoose.model<Job>("Job", JobSchema);

export const insertJobSchema = z.object({
  title: z.string(),
  company: z.string(),
  description: z.string(),
  skills: z.array(z.string()).default([]),
  location: z.string(),
  type: z.enum(["full_time", "part_time", "contract", "remote"]).default("full_time"),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  recruiterId: z.string(),
});

export type InsertJob = z.infer<typeof insertJobSchema>;
