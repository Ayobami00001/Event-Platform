import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITicket extends Document {
  booking: Types.ObjectId;
  ticketCode: string;
  qrCode?: string;
  issuedAt: Date;
  checkedInAt?: Date;
  checkedInBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    ticketCode: {
      type: String,
      required: true,
      unique: true,
    },
    qrCode: {
      type: String,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },

    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", ticketSchema);

export default Ticket;
