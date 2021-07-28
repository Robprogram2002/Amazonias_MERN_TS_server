import { Schema, model } from 'mongoose';
import slugify from 'slugify';

export interface ISubCategory {
  name: string;
  banners: { publicId: string; url: string }[];
  slug: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [4, 'Too short name'],
      maxLength: [70, 'Too long name'],
      index: true,
      unique: true,
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
  },
  { timestamps: true }
);

subCategorySchema.pre<ISubCategory>('save', function () {
  const doc = this;
  doc.slug = slugify(doc.name);
});

export default model<ISubCategory>('Category', subCategorySchema);
