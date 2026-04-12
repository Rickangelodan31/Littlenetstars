import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscription extends Document {
  email: string;
  name: string;
  plan: "saturdays" | "both";
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: "active" | "cancelled" | "past_due" | "pending";
  currentPeriodEnd?: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    plan: { type: String, enum: ["saturdays", "both"], required: true },
    stripeCustomerId: { type: String, default: "" },
    stripeSubscriptionId: { type: String, default: "" },
    status: { type: String, enum: ["active", "cancelled", "past_due", "pending"], default: "pending" },
    currentPeriodEnd: { type: Date },
  },
  { timestamps: true }
);

const Subscription: Model<ISubscription> =
  (mongoose.models.Subscription as Model<ISubscription>) ||
  mongoose.model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;
