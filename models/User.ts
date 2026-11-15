import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type UserRole = "USER" | "ORGANIZER" | "ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  organizationName?: string;
  organizationDescription?: string;
  organizationLogo?: string;
  organizationWebsite?: string;
  organizerBio?: string;
  followingOrganizers?: mongoose.Types.ObjectId[];
  status: UserStatus;
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
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },

    organizationName: {
      type: String,
      trim: true,
    },
    organizationDescription: {
      type: String,
      trim: true,
    },
    organizationLogo: {
      type: String,
    },
    organizationWebsite: {
      type: String,
      trim: true,
    },
    organizerBio: {
      type: String,
      trim: true,
    },

    followingOrganizers: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },

    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED"],
      default: "ACTIVE",
    },
    savedEvents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
  },
  { timestamps: true },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
