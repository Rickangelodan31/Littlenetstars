import mongoose, { Schema, Document, Model } from "mongoose";

export interface IKitItem extends Document {
  name: string;
  description: string;
  price: number;
  photoUrl: string;
  available: boolean;
  order: number;
}

const kitItemSchema = new Schema<IKitItem>(
  {
    name:        { type: String, required: true },
    description: { type: String, default: "" },
    price:       { type: Number, default: 0 },
    photoUrl:    { type: String, default: "" },
    available:   { type: Boolean, default: true },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true },
);

const KitItem: Model<IKitItem> =
  (mongoose.models.KitItem as Model<IKitItem>) ||
  mongoose.model<IKitItem>("KitItem", kitItemSchema);

export default KitItem;
