import { Schema, model } from 'mongoose';

interface IBrand {
  name: string;
  slug: string;
  logo: { publicId: string; url: string };
}

const vendorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [4, 'Too short name'],
      maxLength: [70, 'Too long name'],
      unique: true,
    },
    slug: {
      type: String,
      index: true,
    },
    logo: {
      publicId: { type: String, required: true },
      url: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default model<IBrand>('Brand', vendorSchema);
