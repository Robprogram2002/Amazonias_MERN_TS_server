import { Schema, model } from 'mongoose';

export interface ICategory {
  name: string;
  banners: { publicId: string; url: string }[];
  slug: string;
  departmentId: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [4, 'Too short name'],
      maxLength: [70, 'Too long name'],
      index: true,
      unique: true,
      text: true,
    },
    description: {
      type: String,
      required: true,
      minLength: [50, 'Description must be at least 50 characters long'],
      text: true,
    },
    banners: [
      {
        publicId: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    slug: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
  },
  { timestamps: true }
);

// categorySchema.pre<ICategory>('save', function () {
//   const doc = this;
//   doc.slug = slugify(doc.name);
// });

export default model<ICategory>('Category', categorySchema);
