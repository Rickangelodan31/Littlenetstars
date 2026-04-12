import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: string;
}

const settingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

const Setting: Model<ISetting> =
  (mongoose.models.Setting as Model<ISetting>) || mongoose.model<ISetting>("Setting", settingSchema);
export default Setting;
