import { Schema, model } from 'mongoose';

interface IVendor {
  name: string;
  slug: string;
  description: string;
  sales: number;
  revenue: number;
  image: { publicId: string; url: string };
  contact: {
    person: string;
    email: string;
    phone: string;
  };
  location: {
    country: string;
    state: string;
    address: string;
    postalCode: string;
  };
  socials: {
    facebook: string;
    website: string;
    twetter: string;
  };
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
    description: {
      type: String,
      required: true,
    },
    sales: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'sales must be greater than or equal to 0'],
    },
    revenue: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'revenue must be greater than or equal to 0'],
    },
    image: {
      publicId: { type: String, required: true },
      url: { type: String, required: true },
    },
    location: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      address: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    contact: {
      person: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    socials: {
      facebook: { type: String, required: true },
      website: { type: String, required: true },
      twetter: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default model<IVendor>('Vendor', vendorSchema);
