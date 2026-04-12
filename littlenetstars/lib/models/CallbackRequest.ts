import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICallbackRequest extends Document {
  name: string;
  phone: string;
  question: string;
  handled: boolean;
  createdAt: Date;
}

const schema = new Schema<ICallbackRequest>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    question: { type: String, default: "" },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CallbackRequest: Model<ICallbackRequest> =
  (mongoose.models.CallbackRequest as Model<ICallbackRequest>) ||
  mongoose.model<ICallbackRequest>("CallbackRequest", schema);

export default CallbackRequest;
