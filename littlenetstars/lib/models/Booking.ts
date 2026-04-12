import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  location: string;
  date: Date;
  time: string;
  children: { name: string; age: number }[];
  parent: { name: string; email: string; phone: string };
  status: "pending_payment" | "paid" | "cancelled";
  isFreeSession: boolean;
  stripeSessionId?: string;
  amountPaid?: number;
}

const bookingSchema = new Schema<IBooking>(
  {
    location: { type: String, required: true, enum: ["London", "Manchester"] },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    children: [{ name: { type: String, required: true }, age: { type: Number, required: true } }],
    parent: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true },
    },
    status: { type: String, enum: ["pending_payment", "paid", "cancelled"], default: "pending_payment" },
    isFreeSession: { type: Boolean, default: false },
    stripeSessionId: String,
    amountPaid: Number,
  },
  { timestamps: true }
);

const Booking: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking>) || mongoose.model<IBooking>("Booking", bookingSchema);
export default Booking;
