import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type UserRole = "USER" | "ORGANIZER" | "ADMIN";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  savedEvents: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "ORGANIZER", "ADMIN"],
      default: "USER",
    },
    avatar: {
      type: String,
    },
    phone: {
      type: String,
    },
    savedEvents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;