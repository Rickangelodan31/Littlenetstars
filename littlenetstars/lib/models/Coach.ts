import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoach extends Document {
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  active: boolean;
  order: number;
}

const coachSchema = new Schema<ICoach>(
  {
    name: { type: String, required: true },
    title: { type: String, default: "" },
    bio: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Coach: Model<ICoach> =
  (mongoose.models.Coach as Model<ICoach>) || mongoose.model<ICoach>("Coach", coachSchema);
export default Coach;
