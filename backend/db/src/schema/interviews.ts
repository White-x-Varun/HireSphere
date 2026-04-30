import mongoose, { Schema, type Document } from "mongoose";

export interface Interview extends Document {
  applicationId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  recruiterId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  type: "video" | "in_person" | "phone";
  status: "scheduled" | "completed" | "cancelled";
  meetingLink?: string;
  location?: string;
  notes?: string;
  reminderSent: boolean;
}

const InterviewSchema: Schema = new Schema(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    type: { type: String, enum: ["video", "in_person", "phone"], default: "video" },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    meetingLink: { type: String },
    location: { type: String },
    notes: { type: String },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Interview = mongoose.models.Interview || mongoose.model<Interview>("Interview", InterviewSchema);
