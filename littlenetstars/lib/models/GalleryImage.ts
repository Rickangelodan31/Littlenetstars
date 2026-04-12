import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGalleryImage extends Document {
  imageUrl: string;
  caption: string;
  order: number;
}

const galleryImageSchema = new Schema<IGalleryImage>(
  {
    imageUrl: { type: String, required: true },
    caption: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const GalleryImage: Model<IGalleryImage> =
  (mongoose.models.GalleryImage as Model<IGalleryImage>) ||
  mongoose.model<IGalleryImage>("GalleryImage", galleryImageSchema);
export default GalleryImage;
