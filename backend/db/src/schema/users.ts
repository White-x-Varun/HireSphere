import mongoose, { Schema, type Document } from "mongoose";
import { z } from "zod";

export interface User extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "job_seeker" | "recruiter" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["job_seeker", "recruiter", "admin"], default: "job_seeker" },
  },
  { timestamps: true }
);

// Virtual for id to match the string representation
UserSchema.virtual("id").get(function (this: any) {
  return this._id.toHexString();
});

UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

export const User = mongoose.models.User || mongoose.model<User>("User", UserSchema);

export const insertUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  role: z.enum(["job_seeker", "recruiter", "admin"]).default("job_seeker"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
