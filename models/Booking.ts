import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";

export interface IBooking extends Document {
  user: Types.ObjectId;
  event: Types.ObjectId;
  quantity: number;
  totalPrice: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  currency?: "NGN";
  reservationExpiresAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
      type: Number,
      default: 0,
    },

    bookingStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID", "FAILED", "REFUNDED"],
      default: "UNPAID",
    },

    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
    },

    currency: {
      type: String,
      enum: ["NGN"],
      default: "NGN",
    },

    reservationExpiresAt: {
      type: Date,
    },

    paidAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
