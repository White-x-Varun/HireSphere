import mongoose, { Schema, type Document } from "mongoose";
import { z } from "zod";

export interface Application extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  status: "pending" | "reviewing" | "shortlisted" | "rejected" | "accepted";
  coverLetter?: string;
  resumeId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "rejected", "accepted"],
      default: "pending",
    },
    coverLetter: { type: String },
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume" },
  },
  { timestamps: true }
);

ApplicationSchema.virtual("id").get(function (this: any) {
  return this._id.toHexString();
});

ApplicationSchema.set("toJSON", { virtuals: true });
ApplicationSchema.set("toObject", { virtuals: true });

export const Application = mongoose.models.Application || mongoose.model<Application>("Application", ApplicationSchema);

export const insertApplicationSchema = z.object({
  userId: z.string(),
  jobId: z.string(),
  status: z.enum(["pending", "reviewing", "shortlisted", "rejected", "accepted"]).default("pending"),
  coverLetter: z.string().optional(),
  resumeId: z.string().optional(),
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
