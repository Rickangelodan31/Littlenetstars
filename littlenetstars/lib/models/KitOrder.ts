import mongoose, { Document, Schema } from "mongoose";

export interface IKitOrder extends Document {
  itemId: string;
  itemName: string;
  itemPhoto: string;
  size: string;
  quantity: number;
  customer: { name: string; email: string; phone: string };
  notes: string;
  status: "pending" | "ready" | "collected";
  createdAt: Date;
  updatedAt: Date;
}

const KitOrderSchema = new Schema<IKitOrder>(
  {
    itemId:    { type: String, required: true },
    itemName:  { type: String, required: true },
    itemPhoto: { type: String, default: "" },
    size:      { type: String, default: "" },
    quantity:  { type: Number, default: 1, min: 1 },
    customer: {
      name:  { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
    },
    notes:  { type: String, default: "" },
    status: { type: String, enum: ["pending", "ready", "collected"], default: "pending" },
  },
  { timestamps: true },
);

export default (mongoose.models.KitOrder as mongoose.Model<IKitOrder>) ||
  mongoose.model<IKitOrder>("KitOrder", KitOrderSchema);
