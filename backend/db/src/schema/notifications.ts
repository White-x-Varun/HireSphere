import mongoose, { Schema, type Document } from "mongoose";

export interface Notification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

export const Notification = mongoose.models.Notification || mongoose.model<Notification>("Notification", NotificationSchema);
