import { Schema, model } from 'mongoose';

export interface ISubCategory {
  _id: string;
  name: string;
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
    slug: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },
  },
  { timestamps: true }
);

// subCategorySchema.pre<ISubCategory>('save', function () {
//   const doc = this;
//   doc.slug = slugify(doc.name);
// });

export default model<ISubCategory>('SubCategory', subCategorySchema);
