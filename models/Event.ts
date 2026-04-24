import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type EventMode = "ONLINE" | "PHYSICAL";
export type EventPricing = "FREE" | "PAID";
export type EventStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "UPCOMING"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED"
  | "SOLD_OUT";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  image?: string;
  mode: EventMode;
  pricing: EventPricing;
  price?: number;
  currency: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  locationName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  onlineLink?: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  organizer: Types.ObjectId;
  status: EventStatus;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    image: String,

    mode: {
      type: String,
      enum: ["ONLINE", "PHYSICAL"],
      required: true,
    },

    pricing: {
      type: String,
      enum: ["FREE", "PAID"],
      required: true,
    },

    price: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "USD",
    },

    startDate: {
      type: String,
      required: true,
    },

    endDate: {
      type: String,
      required: true,
    },

    startTime: String,
    endTime: String,

    locationName: String,
    address: String,
    city: String,
    state: String,
    country: String,
    latitude: Number,
    longitude: Number,

    onlineLink: String,

    totalSeats: {
      type: Number,
      required: true,
    },

    bookedSeats: {
      type: Number,
      default: 0,
    },

    availableSeats: {
      type: Number,
      required: true,
    },

    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING",
        "APPROVED",
        "REJECTED",
        "UPCOMING",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
        "SOLD_OUT",
      ],
      default: "PENDING",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;