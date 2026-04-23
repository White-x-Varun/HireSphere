import mongoose, { Schema, type Document } from "mongoose";

export interface Message extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Message = mongoose.models.Message || mongoose.model<Message>("Message", MessageSchema);
